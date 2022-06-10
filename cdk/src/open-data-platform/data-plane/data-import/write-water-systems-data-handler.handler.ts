import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConnectionPool, sql } from '@databases/pg';
import * as AWS from 'aws-sdk';
import { connectToDb } from '../schema/schema.handler';

const { chain } = require('stream-chain');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Batch = require('stream-json/utils/Batch');
const Pick = require('stream-json/filters/Pick');

const S3 = new AWS.S3();

const DEFAULT_NUMBER_ROWS_TO_INSERT = 10;

/**
 * Inserts all rows into the water systems table.
 */
async function insertRows(db: ConnectionPool, rows: WaterSystemsTableRow[]): Promise<any[]> {
  return db.query(sql`INSERT INTO water_systems (pws_id,
                                                 lead_connections_count,
                                                 geom)
                      VALUES ${sql.join(
                        rows.map((row: WaterSystemsTableRow) => {
                          return sql`(${row.pws_id}, ${
                            row.lead_connections_count
                          }, ${sql.__dangerous__rawValue(
                            `ST_AsText(ST_GeomFromGeoJSON('${row.geom}'))`,
                          )})`;
                        }),
                        ',',
                      )};`);
}

/**
 * Inserts all rows into the water systems table.
 */
async function deleteRows(db: ConnectionPool): Promise<any[]> {
  return db.query(sql`DELETE
                      FROM water_systems
                      WHERE pws_id IS NOT NULL`);
}

/**
 * Reads the S3 CSV file and the number of rows successfully written.
 */
function parseS3IntoLeadServiceLinesTableRow(
  s3Params: AWS.S3.GetObjectRequest,
  db: ConnectionPool,
  numberOfRowsToWrite = DEFAULT_NUMBER_ROWS_TO_INSERT,
): Promise<number> {
  return new Promise(function (resolve, reject) {
    const batchSize = 10;
    let numberRows = 0;

    const fileStream = S3.getObject(s3Params).createReadStream();
    let pipeline = chain([
      fileStream,
      Pick.withParser({ filter: 'features' }),
      streamArray(),
      new Batch({ batchSize: batchSize }),
    ]);

    pipeline
      .on('data', async (batch: any[]) => {
        if (numberRows < numberOfRowsToWrite) {
          const results: WaterSystemsTableRow[] = [];

          batch.forEach((data) => {
            const value = data.value;
            const properties = value.properties;

            const row = new WaterSystemsTableRowBuilder()
              .pwsId(properties.pwsid)
              // Sometimes this number is negative because it is based on a
              // regression.
              .leadConnectionsCount(Math.max(parseFloat(properties.lead_connections), 0))
              // Keep JSON formatting. Post-GIS helpers depend on this.
              .geom(JSON.stringify(value.geometry))
              .build();
            results.push(row);
            ++numberRows;
          });

          // Pause reads while inserting into db.
          pipeline.pause();
          await insertRows(db, results);
          pipeline.resume();
        } else {
          // Stop reading stream if numberOfRowsToWrite has been met.
          pipeline.destroy();
        }
      })
      .on('error', (error: Error) => {
        reject(error);
      })
      // Gets called by pipeline.destroy()
      .on('close', async (_: Error) => {
        resolve(numberRows);
      })
      .on('end', async () => {
        resolve(numberRows);
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

  let db: ConnectionPool | undefined;

  // Read CSV file and write to water systems table.
  try {
    db = await connectToDb();
    if (db == undefined) {
      throw Error('Unable to connect to db');
    }

    // Remove existing rows before inserting new ones.
    await deleteRows(db);
    const numberRows = await parseS3IntoLeadServiceLinesTableRow(s3Params, db, numberRowsToWrite);
    return {
      statusCode: 200,
      body: JSON.stringify({ 'Added rows': numberRows }),
    };
  } catch (error) {
    console.log('Error:' + error);
    throw error;
  } finally {
    console.log('Disconnecting from db...');
    await db?.dispose();
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
