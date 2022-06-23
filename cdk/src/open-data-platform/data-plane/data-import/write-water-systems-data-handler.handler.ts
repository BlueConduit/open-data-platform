import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import {
  BatchExecuteStatementRequest,
  BatchExecuteStatementResponse,
  SqlParametersList,
} from 'aws-sdk/clients/rdsdataservice';

const { chain } = require('stream-chain');
const { ignore } = require('stream-json/filters/Ignore');
const { pick } = require('stream-json/filters/Pick');
const { parser } = require('stream-json/Parser');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Batch = require('stream-json/utils/Batch');

// Number of rows to write at once.
const BATCH_SIZE = 10;
const DEFAULT_NUMBER_ROWS_TO_INSERT = 10000;

const S3 = new AWS.S3();

/**
 *  Writes rows into the water systems table.
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
    schema: 'public',
    secretArn: process.env.CREDENTIALS_SECRET ?? '',
    sql: `INSERT INTO water_systems (pws_id,
                                     pws_name,
                                     lead_connections_count,
                                     service_connections_count,
                                     population_served,
                                     geom)
          VALUES (:pws_id,
                  :pws_name,
                  :lead_connections_count,
                  :service_connections_count,
                  :population_served,
                  ST_AsText(ST_GeomFromGeoJSON(:geom))) ON CONFLICT (pws_id) DO NOTHING`,
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
    new WaterSystemsTableRowBuilder()
      .pwsId(properties.pwsid)
      .pwsName(properties.pws_name ?? '')
      .leadConnectionsCount(getValueOrDefault(properties.lead_connections))
      .serviceConnectionsCount(getValueOrDefault(properties.service_connections_count))
      .populationServed(getValueOrDefault(properties.population_served_count))
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
async function parseS3IntoLeadServiceLinesTableRow(
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
          const shouldWriteRow = numberRowsParsed >= startIndex && numberRowsParsed <= endIndex;
          if (shouldWriteRow) {
            tableRows = rows.map(getTableRowFromRow);
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
 * Parses S3 'pwsid_lead_connections_even_smaller.geojson' file and writes rows
 * to water systems table in the MainCluster postgres db.
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
    Key: 'pwsid_lead_connections_even_smaller.geojson',
  };

  try {
    // See https://docs.aws.amazon.com/rds/index.html.
    const rdsService = new AWS.RDSDataService();

    // Read geojson file and write to water systems table.
    const numberRows = await parseS3IntoLeadServiceLinesTableRow(
      s3Params,
      rdsService,
      0,
      numberRowsToWrite,
    );
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

/**
 * Single row for water systems table.
 */
class WaterSystemsTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Water system identifier.
  pws_id: string;
  // Water system name.
  pws_name: string;
  // Reported or estimated number of lead pipes in the boundary.
  lead_connections_count: number;
  // Reported or estimated number of connections in the boundary.
  service_connections_count: number;
  // Number of people served by the water system.
  population_served: number;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    pws_id: string,
    pws_name: string,
    lead_connections_count: number,
    service_connections_count: number,
    population_served: number,
    geom: string,
  ) {
    this.pws_id = pws_id;
    this.pws_name = pws_name;
    this.lead_connections_count = lead_connections_count;
    this.service_connections_count = service_connections_count;
    this.population_served = population_served;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the water systems table.
 */
class WaterSystemsTableRowBuilder {
  private readonly _row: WaterSystemsTableRow;

  constructor() {
    this._row = new WaterSystemsTableRow('', '', 0, 0, 0, '');
  }

  pwsId(pwsId: string): WaterSystemsTableRowBuilder {
    this._row.pws_id = pwsId;
    return this;
  }

  pwsName(pwsName: string): WaterSystemsTableRowBuilder {
    this._row.pws_name = pwsName;
    return this;
  }

  geom(geom: string): WaterSystemsTableRowBuilder {
    this._row.geom = geom;
    return this;
  }

  leadConnectionsCount(leadConnectionsCount: number): WaterSystemsTableRowBuilder {
    this._row.lead_connections_count = leadConnectionsCount;
    return this;
  }

  serviceConnectionsCount(serviceConnectionsCount: number): WaterSystemsTableRowBuilder {
    this._row.service_connections_count = serviceConnectionsCount;
    return this;
  }

  populationServed(populationServed: number): WaterSystemsTableRowBuilder {
    this._row.population_served = populationServed;
    return this;
  }

  build(): SqlParametersList {
    return [
      {
        name: 'pws_id',
        value: { stringValue: this._row.pws_id },
      },
      {
        name: 'pws_name',
        value: { stringValue: this._row.pws_name },
      },
      {
        name: 'lead_connections_count',
        value: { doubleValue: this._row.lead_connections_count },
      },
      {
        name: 'service_connections_count',
        value: { doubleValue: this._row.service_connections_count },
      },
      {
        name: 'population_served',
        value: { doubleValue: this._row.population_served },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom.toString() },
      },
    ];
  }
}
