import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import {
  BatchExecuteStatementRequest,
  BatchExecuteStatementResponse,
  SqlParametersList,
} from 'aws-sdk/clients/rdsdataservice';
import { ParcelsTableRowBuilder } from '../model/parcel_table';

const { chain } = require('stream-chain');
const { ignore } = require('stream-json/filters/Ignore');
const { pick } = require('stream-json/filters/Pick');
const { parser } = require('stream-json/Parser');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Batch = require('stream-json/utils/Batch');

// Number of rows to write at once.
const BATCH_SIZE = 10;
const DEFAULT_NUMBER_ROWS_TO_INSERT = 10000;
const SCHEMA = 'schema';

const S3 = new AWS.S3();

/**
 *  Writes rows into the parcel table.
 * @param rdsService: RDS service to connect to the db.
 * @param rows: Rows to write to the db.
 */
async function insertBatch(
  rdsService: RDSDataService,
  rows: SqlParametersList[],
): Promise<RDSDataService.BatchExecuteStatementResponse> {
  const batchExecuteParams: BatchExecuteStatementRequest = {
    database: process.env.DATABASE_NAME ?? 'postgres',
    parameterSets: rows,
    resourceArn: process.env.RESOURCE_ARN ?? '',
    schema: SCHEMA,
    secretArn: process.env.CREDENTIALS_SECRET ?? '',
    sql: `INSERT INTO parcels (address,
                               public_lead_prediction,
                               private_lead_prediction,
                               geom)
          VALUES (:address,
                  :public_lead_prediction,
                  :private_lead_prediction,
                  ST_AsText(ST_GeomFromGeoJSON(:geom))) ON CONFLICT (address) DO NOTHING`,
  };
  return rdsService.batchExecuteStatement(batchExecuteParams).promise();
}

/**
 * Sometimes these fields are negative because they are based on a regression.
 */
function getValueOrDefault(field: string): number {
  return Math.max(parseFloat(field == 'NaN' || field == null ? '0' : field), 0);
}

/**
 * Maps a data row to a table row ready to write to the db.
 * @param row: row with all data needed to build a [WaterSystemsTableRow].
 */
function getTableRowFromRow(row: any): SqlParametersList {
  const value = row.value;
  const properties = value.properties;
  return (
    new ParcelsTableRowBuilder()
      .address(properties.address)
      .publicLeadPrediction(getValueOrDefault(properties.y_score_pub))
      .privateLeadPrediction(getValueOrDefault(properties.y_score_priv))
      // Keep JSON formatting. Post-GIS helpers depend on this.
      .geom(JSON.stringify(value.geometry))
      .build()
  );
}

/**
 * Reads the S3 file and the number of rows successfully written.
 * @param s3Params: Params that identity the s3 bucket.
 * @param rdsDataService: RDS service to connect to the db.
 * @param startIndex: The row with which to begin writes.
 * @param numberOfRowsToWrite: The number of entries to write to the db.
 */
async function writeS3FileToTable(
  s3Params: AWS.S3.GetObjectRequest,
  rdsDataService: RDSDataService,
  startIndex = 0,
  numberOfRowsToWrite = DEFAULT_NUMBER_ROWS_TO_INSERT,
): Promise<number> {
  return new Promise(function (resolve, reject) {
    let numberRowsParsed = 0;
    const promises: Promise<BatchExecuteStatementResponse | null>[] = [];
    const fileStream = S3.getObject(s3Params).createReadStream();

    let pipeline = chain([
      fileStream,
      parser(),
      pick({ filter: 'features' }),
      streamArray(),
      new Batch({ batchSize: BATCH_SIZE }),
    ]);

    const endIndex = startIndex + numberOfRowsToWrite;
    try {
      pipeline
        .on('data', async (rows: any[]) => {
          // Stop reading stream if this would exceed number of rows to write.
          if (numberRowsParsed + rows.length > endIndex) {
            pipeline.destroy();
          }

          let tableRows: SqlParametersList[] = [];
          const shouldWriteRows = numberRowsParsed >= startIndex && numberRowsParsed <= endIndex;
          if (shouldWriteRows) {
            tableRows = rows.reduce(function (result, row) {
              if (row.value.properties.address != '' && row.value.properties.address != null) {
                result.push(getTableRowFromRow(row));
              }
              return result;
            }, []);
          }

          promises.push(executeBatchOfRows(rdsDataService, tableRows));
          numberRowsParsed += rows.length;
        })
        .on('error', async (error: Error) => {
          reject(error);
        })
        // Gets called by pipeline.destroy()
        .on('close', async (_: Error) => {
          await handleEndOfFilestream(promises);
          resolve(numberRowsParsed);
        })
        .on('end', async () => {
          await handleEndOfFilestream(promises);
          resolve(numberRowsParsed);
        });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Writes the table rows to the db and adds execution to list of promises.
 *
 * @param rdsDataService: RDS service to connect to the db.
 * @param tableRows: Rows to write to the db.
 */
function executeBatchOfRows(
  rdsDataService: RDSDataService,
  tableRows: SqlParametersList[],
): Promise<BatchExecuteStatementResponse | null> {
  let promise: Promise<BatchExecuteStatementResponse | null> = Promise.resolve(null);
  if (tableRows.length > 0) {
    promise = insertBatch(rdsDataService, tableRows);
    promise.catch((_) => {}); // Suppress unhandled rejection.
  }
  return promise;
}

/**
 * Logs number and details of errors that occurred for all inserts.
 * @param promises of SQL executions.
 */
async function handleEndOfFilestream(promises: Promise<BatchExecuteStatementResponse | null>[]) {
  // Unlike Promise.all(), which rejects when a single promise rejects, Promise.allSettled
  // allows all promises to finish regardless of status and aggregated the results.
  const result = await Promise.allSettled(promises);
  const errors = result.filter((p) => p.status == 'rejected') as PromiseRejectedResult[];
  console.log(`Number errors during insert: ${errors.length}`);

  // Log all the rejected promises to diagnose issues.
  errors.forEach((error) => console.log(error.reason));
}

/**
 * Parses S3 'parcels/toledo_parcel_preds.geojson' file and writes rows
 * to parcels in the MainCluster postgres db.
 */
export async function handler(_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const numberRowsToWrite: number = parseInt(
    process.env.numberRows ?? `${DEFAULT_NUMBER_ROWS_TO_INSERT}`,
  );

  const s3Params = {
    Bucket: 'opendataplatformapistaticdata',
    // The geometries have been simplified. This file also only includes
    // the rows we currently write to the db to avoid large javascript
    // objects from being created on streamArray().
    Key: 'parcels/toledo_parcel_preds.geojson',
  };

  try {
    // See https://docs.aws.amazon.com/rds/index.html.
    const rdsService = new AWS.RDSDataService();

    // Read geojson file and write to parcel table.
    const numberRows = await writeS3FileToTable(s3Params, rdsService, 0, numberRowsToWrite);
    console.log(`Parsed ${numberRows} rows`);

    return {
      statusCode: 200,
      body: JSON.stringify({ 'Added rows': numberRows }),
    };
  } catch (error) {
    console.log('Error:' + error);
    throw error;
  }
}
