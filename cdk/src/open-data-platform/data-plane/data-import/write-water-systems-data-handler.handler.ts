import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { Pool, PoolClient, QueryArrayResult } from 'pg';
import { createDatabaseConfig } from '../schema/schema.handler';
import { Readable } from 'stream';

const { chain } = require('stream-chain');
const { streamArray } = require('stream-json/streamers/StreamArray');
const format = require('pg-format');
const Batch = require('stream-json/utils/Batch');
const Pick = require('stream-json/filters/Pick');

const S3 = new AWS.S3();

const DEFAULT_NUMBER_ROWS_TO_INSERT = 10000;

/**
 * Inserts all rows into the water systems table.
 * @param db: Database to use
 * @param rows: Rows to write into the db
 */
async function insertRows(db: PoolClient, rows: WaterSystemsTableRow[]): Promise<QueryArrayResult> {
  const valuesToInsert: any[][] = [];

  for (let row of rows) {
    valuesToInsert.push([
      `'${row.pws_id}'`,
      row.lead_connections_count,
      `ST_AsText(ST_GeomFromGeoJSON('${row.geom}'))`,
    ]);
  }

  // Format function below needs these to be %s (string literals) or else
  // it produces invalid geometries.
  const insertIntoStatement =
    'INSERT INTO water_systems (pws_id, lead_connections_count, geom) ' +
    'VALUES %s ON CONFLICT (pws_id) DO NOTHING';

  try {
    const queryResult = await db.query(format(insertIntoStatement, valuesToInsert), []);
    return queryResult;
  } catch (error) {
    console.log(`Error in writing rows to db ${error}`);
    throw error;
  }
}

/**
 * Reads the S3 file and the number of rows successfully written.
 * @param s3Params: Params that identity the s3 bucket
 * @param db: Database to write to.
 * @param startIndex: The row to begin writes with
 * @param numberOfRowsToWrite: The number of entries to write to the db
 */
async function parseS3IntoLeadServiceLinesTableRow(
  s3Params: AWS.S3.GetObjectRequest,
  db: PoolClient,
  startIndex = 0,
  numberOfRowsToWrite = DEFAULT_NUMBER_ROWS_TO_INSERT,
): Promise<number> {
  return new Promise(function (resolve, reject) {
    const batchSize = 10;
    let numberRowsParsed = 0;
    const promises: Promise<QueryArrayResult>[] = [];

    const fileStream = S3.getObject(s3Params).createReadStream();
    let pipeline = chain([
      fileStream,
      Pick.withParser({ filter: 'features' }),
      streamArray(),
      new Batch({ batchSize: batchSize }),
    ]);

    const endIndex = startIndex + numberOfRowsToWrite;
    let results: WaterSystemsTableRow[] = [];
    pipeline
      .on('data', async (rows: any[]) => {
        if (numberRowsParsed >= startIndex && numberRowsParsed < endIndex) {
          for (let row of rows) {
            const value = row.value;
            const properties = value.properties;
            const lead_connections =
              properties.lead_connections != 'NaN' && properties.lead_connections != null
                ? properties.lead_connections
                : 0.0;

            const tableRowToInsert = new WaterSystemsTableRowBuilder()
              .pwsId(properties.pwsid)
              // Sometimes this number is negative because it is based on a
              // regression.
              .leadConnectionsCount(Math.max(parseFloat(lead_connections), 0))
              // Keep JSON formatting. Post-GIS helpers depend on this.
              .geom(JSON.stringify(value.geometry))
              .build();
            results.push(tableRowToInsert);
          }
          // Every batch size, write into the db.
          if (results.length == batchSize) {
            promises.push(insertRows(db, results));
            results = [];
          }
        } else if (numberRowsParsed >= endIndex) {
          // If there are any results left, write those.
          if (results.length > 0) {
            promises.push(insertRows(db, results));
          }

          // Stop reading stream if numberOfRowsToWrite has been met.
          pipeline.destroy();
        }
        numberRowsParsed += rows.length;
        console.log(`Parsed ${numberRowsParsed}`);
      })
      .on('error', async (error: Error) => {
        await Promise.all(promises);
        reject(error);
      })
      // Gets called by pipeline.destroy()
      .on('close', async (_: Error) => {
        await Promise.all(promises);
        resolve(numberRowsParsed);
      })
      .on('end', async () => {
        await Promise.all(promises);
        resolve(numberRowsParsed);
      });
  });
}

/**
 * Parses S3 'pwsid_lead_connections.geojson' file and writes rows
 * to water systems table in the MainCluster postgres db.
 */
export async function handler(_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const numberRowsToWrite: number = parseInt(
    process.env.numberRows ?? `${DEFAULT_NUMBER_ROWS_TO_INSERT}`,
  );

  const s3Params = {
    Bucket: 'opendataplatformapistaticdata',
    Key: 'pwsid_lead_connections.geojson',
  };

  // TODO(breuch): Update helpers to use new library.
  const config = await createDatabaseConfig();
  try {
    const pool = new Pool({
      user: config.user,
      host: config.host as string,
      database: config.database,
      password: config.password,
      port: config.port as number,
      connectionTimeoutMillis: 900000,
    });

    const db = await pool.connect();

    // Read CSV file and write to water systems table.
    const numberRows = await parseS3IntoLeadServiceLinesTableRow(
      s3Params,
      db,
      0,
      numberRowsToWrite,
    );

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
