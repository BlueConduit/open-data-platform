import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { AnyLengthString } from 'aws-sdk/clients/comprehendmedical';

// These libraries don't have types, so they are imported in a different way.
const { chain } = require('stream-chain');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Batch = require('stream-json/utils/Batch');
const Pick = require('stream-json/filters/Pick');

export interface ImportRequest {
  rowOffset?: number;
  rowLimit?: number;
  batchSize?: number;
}

interface ImportResult {
  processedBatchCount: number;
  sucessfulBatchCount: number;
  erroredBatchCount: number;
}

// These are defined here because the geoJsonHandlerFactory function signature was unreadable.
type ImportCallback = (rows: any[], db: AWS.RDSDataService) => Promise<void>;
type ImportHandler = (event: ImportRequest) => Promise<APIGatewayProxyResult>;

const S3 = new AWS.S3();

/**
 * Builds a lambda handler that parses a GeoJSON file and executes a callback.
 *
 * The callback takes in a set of rows and should insert them into the DB using the provided db
 * instance.
 *
 * You can invoke the lambda via the web console and provide an ImportRequest to skip a set of rows
 * or limit the import to a max number. The lambda will attempt to honor the limit, but it may
 * exceed it due to how it proccesses rows in parallel. Example:
 *
 * {
 *   "rowOffset": 0,
 *   "rowLimit": 27000,
 *   "batchSize": 10
 * }
 *
 * @param s3Params - Details for how to get the GeoJSON file.
 * @param callback - Function that operates on a batch of rows from the file.
 * @returns
 */
export const geoJsonHandlerFactory =
  (s3Params: AWS.S3.GetObjectRequest, callback: ImportCallback): ImportHandler =>
  async (event: ImportRequest): Promise<APIGatewayProxyResult> => {
    // Use arguments or defaults.
    const rowOffset = event.rowOffset ?? 0;
    const rowLimit = event.rowLimit ?? Infinity;
    const batchSize = event.batchSize ?? 10;
    console.log('Starting import:', { rowLimit, rowOffset, batchSize, s3Params });

    const db = new AWS.RDSDataService();
    let results: ImportResult = {
      processedBatchCount: 0,
      sucessfulBatchCount: 0,
      erroredBatchCount: 0,
    };

    try {
      results = await readGeoJsonFile(db, s3Params, callback, rowOffset, rowLimit, batchSize);
    } catch (error) {
      console.log(`Error after processing ${results.processedBatchCount} batches:`, error);
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
): Promise<ImportResult> =>
  new Promise((resolve, reject) => {
    let batchId = 0;
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
        const id = `batch-${batchId++}`;

        // Skip rows up to offset.
        if (skippedRowCount + batchSize <= rowOffset) {
          skippedRowCount += batchSize;
          console.log(
            `${id}: Skipping batch of ${rows.length} rows. ${skippedRowCount}/${rowOffset} offset rows have been skipped so far.`,
          );
          return;
        }

        // Start processing the row.
        console.log(`${id}: Processing batch of ${rows.length} rows.`);
        const promise = callback(rows, db);
        promises.push(promise);

        // Reprocess errored rows individually. This may catch transient errors, or at least let
        // other rows in the batch succeed.
        promise.catch((_) =>
          rows.forEach((row) => {
            console.log(`${id}: Reprocessing errored row individually.`, row.value?.properties);
            const rePromise = callback([row], db);
            rePromise.catch((reason) => console.log(`${id}: Reprocessing failed`, reason));
            promises.push(rePromise);
          }),
        );

        try {
          // Await this batches so we know whether to increment the row count.
          // This does not block other batches from being processed in parallel.
          await promise;
          processedRowCount += rows.length;
          console.log(`${id}: ${processedRowCount} rows have been processed so far.`);
        } catch (error) {
          // Handle in the promise.
        }

        // Stop reading stream if this would exceed number of rows to write.
        // This check is done at the end because it doesn't know how many rows are currently
        // being processed in parallel.
        if (processedRowCount > rowLimit) {
          console.log(`${id}: Stopping after passing row limit:`, rowLimit);
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
