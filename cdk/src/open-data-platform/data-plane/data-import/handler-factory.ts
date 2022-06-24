import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { connectToDb } from '../schema/schema.handler';

// These libraries don't have types, so they are imported in a different way.
const { chain } = require('stream-chain');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Batch = require('stream-json/utils/Batch');
const Pick = require('stream-json/filters/Pick');

interface ImportResult {
  processedBatchCount: number;
  sucessfulBatchCount: number;
  erroredBatchCount: number;
}

const S3 = new AWS.S3();

/**
 * Builds a lambda handler that parses a GeoJSON file and executes a callback.
 * @param s3Params - Details for how to get the GeoJSON file.
 * @param callback - Function that operates on a single element from the file.
 * @param rowOffset - Number of rows to skip before processing.
 * @param rowLimit - Number of rows to process.
 * @returns
 */
export const geoJsonHandlerFactory = (
  s3Params: AWS.S3.GetObjectRequest,
  callback: (rows: any[], db: AWS.RDSDataService) => Promise<void>,
  rowOffset: number = 0,
  rowLimit: number = Infinity,
): ((event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>) => {
  /**
   * Reads an GeoJSON file and performs the callback on each element. This does not handle any
   * processing of the data itself, but provides a DB connection to the callback to process it.
   *
   * TODO: track how many rows were processed and avoid re-importing the old rows.
   *
   * @param db - Connection pool to the DB, made available to the callback.
   * @returns
   */
  const readGeoJsonFile = (db: AWS.RDSDataService): Promise<ImportResult> =>
    new Promise((resolve, reject) => {
      const batchSize = 10;
      let processedRowCount = 0;
      let skippedRowCount = 0;

      console.log('Starting to process file in S3:', s3Params);

      // Store all of the promises returned by the callback so the Lambda waits for their resolution
      // before exiting. They will start to execute before they are awaited and run asynchonously
      // in-parallel with no guarantee of order.
      const promises: Promise<any>[] = [];

      const fileStream = S3.getObject(s3Params).createReadStream();
      let pipeline = chain([
        fileStream,
        Pick.withParser({ filter: 'features' }),
        streamArray(),
        new Batch({ batchSize }),
      ]);

      pipeline
        .on('data', async (rows: any[]) => {
          // Skip rows up to offset.
          if (skippedRowCount + batchSize <= rowOffset) {
            skippedRowCount += batchSize;
            console.log(
              `Skipping batch of ${rows.length} rows. ${skippedRowCount}/${rowOffset} offset rows have been skipped so far.`,
            );
            return;
          }

          console.log(`Processing batch of ${rows.length} rows.`);
          const promise = callback(rows, db);
          promises.push(promise);
          await promise;
          processedRowCount += rows.length;
          console.log(`${processedRowCount} rows have been processed so far.`);
          // Stop reading stream if this would exceed number of rows to write.
          // This check is done at the end because it doesn't know how many rows are currently
          // being processed in parallel.
          if (processedRowCount > rowLimit) {
            console.log('Stopping after passing row limit:', rowLimit);
            pipeline.destroy();
            return;
          }
        })
        .on('error', (error: Error) => {
          reject(error);
        })
        // Gets called by pipeline.destroy()
        .on('close', async (_: Error) => resolve(await handleEndOfFilestream(promises)))
        .on('end', async () => resolve(await handleEndOfFilestream(promises)));
    });

  /**
   * Logs number and details of errors that occurred for all inserts.
   * @param promises of SQL executions.
   */
  const handleEndOfFilestream = async (promises: Promise<any>[]): Promise<ImportResult> => {
    // Unlike Promise.all(), which rejects when a single promise rejects, Promise.allSettled
    // allows all promises to finish regardless of status and aggregated the results.
    const result = await Promise.allSettled(promises);
    const errors = result.filter((p) => p.status == 'rejected') as PromiseRejectedResult[];
    console.log(`Number errors during insert: ${errors.length}`);

    // Log all the rejected promises to diagnose issues.
    errors.forEach((error) => console.log('Failed to process row:', error.reason));

    return {
      processedBatchCount: promises.length,
      erroredBatchCount: errors.length,
      sucessfulBatchCount: promises.length - errors.length,
    };
  };

  /**
   * Constructed handler that imports GeoJSON data to a DB.
   */
  const handler = async (_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const db = new AWS.RDSDataService();
    let results: ImportResult = {
      processedBatchCount: 0,
      sucessfulBatchCount: 0,
      erroredBatchCount: 0,
    };
    try {
      results = await readGeoJsonFile(db);
    } catch (error) {
      console.log(`Error after processing ${results.processedBatchCount} batches:`, error);
      throw error;
    }
    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  };

  return handler;
};
