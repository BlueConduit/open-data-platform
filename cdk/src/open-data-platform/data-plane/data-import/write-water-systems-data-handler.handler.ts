import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, BatchExecuteStatementResponse, SqlParameterSets, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

const { chain } = require('stream-chain');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Batch = require('stream-json/utils/Batch');
const Pick = require('stream-json/filters/Pick');

const S3 = new AWS.S3();

// SQL to insert rows into the DB. If row is already in the DB, row is skipped.
const INSERT_ROWS_SQL = `INSERT INTO water_systems (pws_id,
                                                    lead_connections_count,
                                                    geom)
                         VALUES (:PwsId, :LeadConnectionsCount,
                                 ST_AsText(ST_GeomFromGeoJSON(:Geom))) ON CONFLICT (pws_id) DO NOTHING`;

/**
 * Reads the S3 CSV file and the number of rows successfully written.
 */
function parseS3IntoLeadServiceLinesTableRows(
  s3Params: AWS.S3.GetObjectRequest,
  rdsDataService: RDSDataService,
  numberOfRowsToWrite: number,
): Promise<WaterSystemsTableRow[]> {

  return new Promise(function(resolve, reject) {
    // List of inserted rows. This is used to log the number of successful inserts when the parsing
    // is complete.
    const insertedRows: WaterSystemsTableRow[] = [];
    // Number of rows per read batch.
    const batchSize = 5;
    let parsedRowsCount = 0;

    const fileStream = S3.getObject(s3Params).createReadStream();
    let pipeline = chain([
      fileStream,
      Pick.withParser({ filter: 'features' }),
      streamArray(),
      new Batch({ batchSize: batchSize }),
    ]);
    pipeline
      .on('data', async (batch: any[]) => {
        if (parsedRowsCount < numberOfRowsToWrite) {
          const batchRows: WaterSystemsTableRow[] = batch.map(waterSystemsTableRowFromGeoJSON);

          // Pause read while inserting.
          pipeline.pause();

          // Call to insert rows into DB.
          insertBatch(rdsDataService, batchRows).then(() => {
            insertedRows.push(...batchRows);
          }).catch(() => {
            console.log('Batch failed to insert.');
          });
          parsedRowsCount += batch.length;

          // Resume readstream.
          pipeline.resume();
        } else {
          // Stop reading stream if numberOfRowsToWrite has been met.
          pipeline.destroy();
        }
      })
      .on('error', (error: Error) => {
        console.log(`Error while parsing readstream: ${error}`);
        reject(error);
      })
      // Gets called by pipeline.destroy()
      .on('close', async (_: Error) => {
        resolve(insertedRows);
      })
      .on('end', async () => {
        resolve(insertedRows);
      });
  });
}

/**
 * Inserts a batch of WaterSystemsTableRows into the DB using the RDSDataService's
 * batchExecuteStatement function.
 */
async function insertBatch(rdsService: RDSDataService, rows: WaterSystemsTableRow[]): Promise<BatchExecuteStatementResponse | null> {
  return new Promise(function(resolve, reject) {
    const rowsAsParameterArray: SqlParameterSets = rows.map(rowToSqlParameterList);
    if (process.env.RESOURCE_ARN == undefined) {
      console.log('Error: empty RESOURCE_ARN.');
    }
    if (process.env.SECRET_ARN == undefined) {
      console.log('Error: empty SECRET_ARN.');
    }
    try {
      const batchExecuteParams: BatchExecuteStatementRequest = {
        database: process.env.DATABASE_NAME,
        parameterSets: rowsAsParameterArray,
        resourceArn: process.env.RESOURCE_ARN ?? '',
        schema: 'public',
        secretArn: process.env.SECRET_ARN ?? '',
        sql: INSERT_ROWS_SQL,
      };

      return rdsService.batchExecuteStatement(batchExecuteParams, function(err, data) {
        if (err) {
          console.log(`batchExecuteStatement returned error: ${JSON.stringify(err.stack)}`);
          reject(err);
        } else {
          resolve(data);
        }
      });
    } catch (e) {
      console.log(`Error thrown while calling batchExecuteStatement: ${JSON.stringify(e)}`);
      reject(e);
      return null;
    }
  });
}

/**
 * Parses S3 'pwsid_lead_connections.geojson' file and writes rows
 * to water systems table in the MainCluster postgres db.
 */
export async function handler(_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const s3Params = {
    Bucket: 'opendataplatformapistaticdata',
    Key: 'pwsid_lead_connections.geojson',
  };

  const rdsService = new AWS.RDSDataService();
  let numberRowsToWrite = Infinity;
  if (process.env.numberRows) {
    numberRowsToWrite = parseInt(process.env.numberRows);
  }

  const rows = await parseS3IntoLeadServiceLinesTableRows(s3Params, rdsService, numberRowsToWrite);

  return {
    statusCode: 200,
    body: JSON.stringify(`Successful insert of ${rows.length} rows.`),
  };
}

/**
 * Converts parsed GeoJSON row into a WaterSystemsTableRow.
 */
function waterSystemsTableRowFromGeoJSON(row: any) {
  const feature = row.value;
  const properties = feature.properties;
  const lead_connections =
    (properties.lead_connections == 'NaN' || properties.lead_connections == null)
      ? 0 : properties.lead_connections;

  return new WaterSystemsTableRowBuilder()
    .pwsId(properties.pwsid)
    // Sometimes this number is negative because it is based on a
    // regression.
    .leadConnectionsCount(Math.max(parseFloat(lead_connections), 0))
    // Keep JSON formatting. Post-GIS helpers depend on this.
    .geom(JSON.stringify(feature.geometry))
    .build();
}

/**
 * Maps WaterSystemsTableRow to SqlParametersList which contains array of key/value pairs which
 * are the db columns to insert and the row's value for those columns.
 */
function rowToSqlParameterList(row: WaterSystemsTableRow): SqlParametersList {
  return [
    {
      name: 'PwsId',
      value: { stringValue: row.pws_id },
    },
    {
      name: 'LeadConnectionsCount',
      value: { longValue: row.lead_connections_count },
    },
    {
      name: 'Geom',
      value: { stringValue: row.geom.toString() },
    },
  ];
}

/**
 * Single row for water systems table.
 */
class WaterSystemsTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Water system identifier.
  pws_id: string;
  // Reported or estimated number of lead pipes in the boundary.
  lead_connections_count: number;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(pws_id: string, lead_connections_count: number, geom: string) {
    this.pws_id = pws_id;
    this.lead_connections_count = lead_connections_count;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the water systems table.
 */
class WaterSystemsTableRowBuilder {
  private readonly _row: WaterSystemsTableRow;

  constructor() {
    this._row = new WaterSystemsTableRow('', 0, '');
  }

  pwsId(pwsId: string): WaterSystemsTableRowBuilder {
    this._row.pws_id = pwsId;
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

  build(): WaterSystemsTableRow {
    return this._row;
  }
}
