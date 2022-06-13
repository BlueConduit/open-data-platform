import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConnectionPool, sql } from '@databases/pg';
import * as AWS from 'aws-sdk';
import { connectToDb } from '../schema/schema.handler';

const { chain } = require('stream-chain');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Batch = require('stream-json/utils/Batch');
const Pick = require('stream-json/filters/Pick');
const moment = require('moment');

const S3 = new AWS.S3();

const DEFAULT_NUMBER_ROWS_TO_INSERT = 10;

const VIOLATION = 'SDWISDM.VIOLATION';
const VIOLATION_ID = `${VIOLATION}.VIOLATION_ID`;
const PWSID = `${VIOLATION}.VIOLATION_ID`;
const VIOLATION_CODE = `${VIOLATION}.VIOLATION_CODE`;
const COMPLIANCE_STATUS_CODE = `${VIOLATION}.COMPLIANCE_STATUS_CODE`;
const COMPL_PER_BEGIN_DATE = `${VIOLATION}.COMPL_PER_BEGIN_DATE`;

/**
 * Status codes that indicate a Lead and Copper Rule violation.
 * See https://www.epa.gov/sites/default/files/2019-07/documents/environments-and-contaminants-methods-drinking-water.pdf
 * Page 4.
 */
const LEAD_AND_COPPER_VIOLATIONS = new Set(['57', '58', '59', '63', '65']);

const COMPLIANCE_STATUS_MAP = new Map([
  // Indicates the violation is not open but the system has not yet been
  // designated as returned to compliance.
  ['K', 'Known'],
  ['O', 'Open'],
  ['R', 'Return to compliance'],
]);

/**
 * Inserts all rows into the violations table.
 */
async function insertRows(db: ConnectionPool, rows: ViolationsTableRow[]): Promise<any[]> {
  return db.query(sql`INSERT INTO epa_violations (violation_id,
                                                  pws_id,
                                                  violation_code,
                                                  compliance_status,
                                                  start_date)
                      VALUES ${sql.join(
                        rows.map((row: ViolationsTableRow) => {
                          return sql`(${row.violation_id}, ${row.pws_id},
                                                 ${row.violation_code},
                                                 ${row.compliance_status},
                                                 ${row.start_date})`;
                        }),
                        ',',
                      )} ON CONFLICT (violation_id) DO UPDATE;`);
}

/**
 * Reads the S3 CSV file and the number of rows successfully written.
 */
function parseS3IntoViolationsTableRow(
  s3Params: AWS.S3.GetObjectRequest,
  db: ConnectionPool,
  startIndex: number,
  numberOfRowsToWrite = DEFAULT_NUMBER_ROWS_TO_INSERT,
): Promise<number> {
  return new Promise(function (resolve, reject) {
    const batchSize = 10;
    let numberRowsParsed = 0;
    let results: ViolationsTableRow[] = [];

    const fileStream = S3.getObject(s3Params).createReadStream();
    let pipeline = chain([
      fileStream,
      Pick.withParser({ filter: 'features' }),
      streamArray(),
      new Batch({ batchSize: batchSize }),
    ]);

    pipeline
      .on('data', async (row: any[]) => {
        const endIndex = startIndex + numberOfRowsToWrite;
        if (numberRowsParsed >= startIndex && numberRowsParsed <= endIndex) {
          for (const data of row) {
            const value = data.value;
            const properties = value.properties;

            // Skip violations outside of Lead and Copper Rule violations.
            if (LEAD_AND_COPPER_VIOLATIONS.has(properties[VIOLATION_CODE])) {
              const startDate = moment(properties[COMPL_PER_BEGIN_DATE], 'DD-MMM-YY');
              const violationsRow = new ViolationsTableRowBuilder()
                .violationId(properties[VIOLATION_ID])
                .pwsId(properties[PWSID])
                .violationCode(properties[VIOLATION_CODE])
                .complianceStatus(
                  COMPLIANCE_STATUS_MAP.get(properties[COMPLIANCE_STATUS_CODE]) ?? '',
                )
                .startDate(startDate.format('YYYY-MM-DD'))
                .build();
              results.push(violationsRow);

              // Every row size, write into the db.
              if (results.length == batchSize) {
                // Pause reads while inserting into db.
                fileStream.pause();
                await insertRows(db, results);
                results = [];
                fileStream.resume();
              }
            }
          }
        } else if (numberRowsParsed > endIndex) {
          // Stop reading stream if numberOfRowsToWrite has been met.
          pipeline.destroy();
        }
        numberRowsParsed += row.length;
      })
      .on('error', (error: Error) => {
        reject(error);
      })
      // Gets called by pipeline.destroy()
      .on('close', async (_: Error) => {
        resolve(numberRowsParsed);
      })
      .on('end', async () => {
        resolve(numberRowsParsed);
      });
  });
}

/**
 * Parses S3 'violations_by_water_system.csv' file and writes rows
 * to violations table in the MainCluster postgres db.
 */
export async function handler(_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const numberRowsToWrite: number = parseInt(
    process.env.numberRows ?? `${DEFAULT_NUMBER_ROWS_TO_INSERT}`,
  );

  const startIndex = parseInt(process.env.startIndex ?? '0');

  const s3Params = {
    Bucket: 'opendataplatformapistaticdata',
    Key: 'violations_with_geom.geojson',
  };

  let db: ConnectionPool | undefined;

  // Read CSV file and write to violations table.
  try {
    db = await connectToDb();
    if (db == undefined) {
      throw Error('Unable to connect to db');
    }

    const numberRows = await parseS3IntoViolationsTableRow(
      s3Params,
      db,
      startIndex,
      numberRowsToWrite,
    );
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
 * Single row for violations table.
 */
class ViolationsTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Water system identifier.
  violation_id: string;
  // Water system identifier.
  pws_id: string;
  // Code for the violation.
  violation_code: string;
  // Status of violation.
  compliance_status: string;
  // Date the violation began in the form of YYYY-mm-dd.
  start_date: string;

  constructor(
    pws_id: string,
    violation_id: string,
    violation_code: string,
    compliance_status: string,
    start_date: string,
  ) {
    this.pws_id = pws_id;
    this.violation_id = violation_id;
    this.violation_code = violation_code;
    this.start_date = start_date;
  }
}

/**
 * Builder utility for rows of the violations table.
 */
class ViolationsTableRowBuilder {
  private readonly _row: ViolationsTableRow;

  constructor() {
    this._row = new ViolationsTableRow('', '', '', '', '', '');
  }

  violationId(violationId: string): ViolationsTableRowBuilder {
    this._row.violation_id = violationId;
    return this;
  }

  pwsId(pwsId: string): ViolationsTableRowBuilder {
    this._row.pws_id = pwsId;
    return this;
  }

  violationCode(violationCode: string): ViolationsTableRowBuilder {
    this._row.violation_code = violationCode;
    return this;
  }

  complianceStatus(complianceStatus: string): ViolationsTableRowBuilder {
    this._row.compliance_status = complianceStatus;
    return this;
  }

  startDate(startDate: string): ViolationsTableRowBuilder {
    this._row.start_date = startDate;
    return this;
  }

  build(): ViolationsTableRow {
    return this._row;
  }
}
