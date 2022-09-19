import { APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { ParallelSink } from './utils/parallel-sink';
import { offset, limit } from './utils/stream-utils';

// These libraries don't have types, so they are imported in a different way.
const { chain } = require('stream-chain');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Batch = require('stream-json/utils/Batch');
const Pick = require('stream-json/filters/Pick');

const SINK_CONCURRENCY = 5;

export interface ProcessRequest {
  rowOffset?: number;
  rowLimit?: number;
  batchSize?: number;
}

interface ProcessResult {
  savedRowCount: number;
  failedRowCount: number;
}

// These are defined here because the geoJsonHandlerFactory function signature was unreadable.
type ProcessCallback = (rows: any[], db: AWS.RDSDataService) => Promise<any>;
type FinalCallback = (db: AWS.RDSDataService) => Promise<any>;
type ProcessHandler = (event: ProcessRequest, context: any) => Promise<APIGatewayProxyResult>;

const S3 = new AWS.S3();

/**
 * Builds a lambda handler that parses a GeoJSON file and executes a callback.
 *
 * The callback takes in a set of rows and should insert them into the DB using the provided db
 * instance.
 *
 * You can invoke the lambda via the web console and provide an ProcessRequest to skip a set of rows
 * or limit the process to a max number. The lambda will attempt to honor the limit, but it may
 * exceed it due to how it proccesses rows in parallel. Example:
 *
 * {
 *   "rowOffset": 0,
 *   "rowLimit": 27000,
 *   "batchSize": 10
 * }
 *
 * @param s3Params - Details for how to get the GeoJSON file.
 * @param processCallback - Function that operates on a batch of rows from the file.
 * @param finalCallback - Optional function that is invoked after all rows have been processed.
 * @param batchSizeOverride - Optional number of rows to process in each batch. Defaults to 10.
 * @returns
 */
export const geoJsonHandlerFactory = (
  s3Params: AWS.S3.GetObjectRequest,
  processCallback: ProcessCallback,
  finalCallback?: FinalCallback,
  batchSizeOverride?: number,
): ProcessHandler => async (event: ProcessRequest): Promise<APIGatewayProxyResult> => {
    // Use arguments or defaults.
    let rowOffset = event.rowOffset ?? 0;
    const rowLimit = event.rowLimit ?? Infinity;
    const batchSize = batchSizeOverride ?? event.batchSize ?? 10;

    const db = new AWS.RDSDataService();
    let results: ProcessResult = {
      savedRowCount: 0,
      failedRowCount: 0,
    };

    try {
      console.log(`Importing rows starting from: ${rowOffset}`);
      results = await readGeoJsonFile(db, s3Params, processCallback, rowOffset, rowLimit, batchSize);
      console.log(`Row import complete`);
      if(finalCallback){
        console.log(`Invoking final callback...`);
        await finalCallback(db);
        console.log('Final callback complete');
      }
    } catch (error) {
      console.log(`Error after processing ${results.failedRowCount} rows:`, error);
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  };

/**
 * Reads an GeoJSON file and performs the callback on each element. This does not handle any
 * processing of the data itself, but provides a DB connection to the callback to process it.
 *
 * TODO: track how many batches are running in parallel and stop after a limit.
 *
 * @param db - Connection pool to the DB, made available to the callback.
 * @param s3Params - Details for how to get the GeoJSON file.
 * @param callback - Function that operates on a single element from the file.
 * @param rowOffset - Number of rows to skip.
 * @param rowLimit - Max number of rows to process.
 * @param batchSize - Number of rows in each batch.
 * @returns
 */
const readGeoJsonFile = (
  db: AWS.RDSDataService,
  s3Params: AWS.S3.GetObjectRequest,
  callback: (rows: any[], db: AWS.RDSDataService) => Promise<void>,
  rowOffset: number,
  rowLimit: number,
  batchSize: number,
): Promise<ProcessResult> =>
  new Promise((resolve, reject) => {
    let batchId = 0; // Not-necessarily-sequential ID used to group logs.
    let savedRowCount = 0;
    let failedRowCount = 0;
    const failedBatches: Batch[] = [];

    interface Batch {
      id: string;
      rows: any[];
    }

    console.log('Starting to process file in S3:', s3Params);

    const handleBadBatch = (e: Error, batch: Batch) => {
      console.log(`${batch.id} failed. Scheduling retry...`, e);
      failedBatches.push(batch);
    };

    const saveBatch = async (batch: Batch) => {
      const descriptor = `${batch.id} of ${batch.rows.length} rows`;
      console.log(`processing ${descriptor}`);
      const start = Date.now();
      try {
        await callback(batch.rows, db);
        savedRowCount += batch.rows.length;
      } catch(e) {
        throw e; // handle in handleBadBatch
      }
      console.log(`${descriptor} saved in ${Date.now() - start} ms`);
    };

    // Called once the pipeline finishes and asks the sink to flush the last few rows.
    // Not called if the source dries up and the sink has nothing to flush. 
    const handleEndOfFilestream = async () => {
      const failedRows : [any, Error][] = [];

      for(let i=0; i<failedBatches.length; i++){
        const batch = failedBatches[i];

        for(let j=0; j<batch.rows.length; j++){
          const row = batch.rows[j];

          try {
            console.log(`Retrying ${batch.id} row ${j}`);
            await callback([row], db);
            savedRowCount++;
            console.log(`Batch ${batch.id} row ${j} saved.`);
          } catch (e) {
            console.log(`${batch.id} row ${j} failed.`);
            failedRows.push([row, e as Error]);
            failedRowCount++;
          }
        }
      }

      console.log(`Number errors during processing: ${failedRowCount}`);
      failedRows.forEach(([row, error]) => console.log(row, error));
      return resolve({ savedRowCount, failedRowCount });
    }

    const fileStream = S3.getObject(s3Params).createReadStream();
    let pipeline = chain([
      fileStream,
      Pick.withParser({ filter: 'features' }),
      streamArray(),
      offset(rowOffset),
      limit(rowLimit),
      new Batch({ batchSize }),
      (rows: any[]) => ({ rows, id: `batch-${batchId++}` }),
      ParallelSink(SINK_CONCURRENCY, saveBatch, handleBadBatch, handleEndOfFilestream)
    ]);

    pipeline.on('error', (error: Error) => reject(error));
     // called when the source dries up. May happen if the last rows are ignored by the limiter. 
    pipeline.on('finish', handleEndOfFilestream);
  });
