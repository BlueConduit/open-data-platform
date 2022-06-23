import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { createDatabaseConfig } from '../schema/schema.handler';
import { Pool, PoolClient, QueryArrayResult } from 'pg';

const { chain } = require('stream-chain');
const { pick } = require('stream-json/filters/Pick');
const { parser } = require('stream-json/Parser');
const { streamArray } = require('stream-json/streamers/StreamArray');
const format = require('pg-format');
const Batch = require('stream-json/utils/Batch');
const moment = require('moment');

const S3 = new AWS.S3();

const BATCH_SIZE = 10;
const DEFAULT_NUMBER_ROWS_TO_INSERT = 10000;
const POSTGRESQL_DATE_FORMAT = 'YYYY-MM-DD';
const EPA_API_DATE_FORMAT = 'DD-MMM-YY';

const VIOLATION = 'SDWISDM.VIOLATION';
const VIOLATION_ID = `${VIOLATION}.VIOLATION_ID`;
const PWSID = `${VIOLATION}.PWSID`;
const VIOLATION_CODE = `${VIOLATION}.VIOLATION_CODE`;
const COMPLIANCE_STATUS_CODE = `${VIOLATION}.COMPLIANCE_STATUS_CODE`;
const COMPL_PER_BEGIN_DATE = `${VIOLATION}.COMPL_PER_BEGIN_DATE`;
const COMPL_PER_END_DATE = `${VIOLATION}.COMPL_PER_END_DATE`;

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
 * @param db: Database to use
 * @param rows: Rows to write into the db
 */
async function insertRows(db: PoolClient, rows: ViolationsTableRow[]): Promise<QueryArrayResult> {
  const valuesToInsert: any[][] = [];

  for (let row of rows) {
    valuesToInsert.push([
      row.violation_id,
      row.pws_id,
      row.violation_code,
      row.compliance_status,
      row.start_date,
    ]);
  }

  // Format function below needs these to be %s (string literals) or else
  // it produces invalid geometries.
  const insertIntoStatement =
    'INSERT INTO epa_violations (violation_id, pws_id,violation_code, compliance_status, start_date) ' +
    'VALUES %L ON CONFLICT (violation_id) DO NOTHING';

  return db.query(format(insertIntoStatement, valuesToInsert), []);
}

/**
 * Reads the S3 file and the number of rows successfully written.
 * @param s3Params: Params that identity the s3 bucket
 * @param db: Database to write to.
 * @param startIndex: The row to begin writes with
 * @param numberOfRowsToWrite: The number of entries to write to the db
 */
function parseS3IntoViolationsTableRow(
  s3Params: AWS.S3.GetObjectRequest,
  db: PoolClient,
  startIndex: number,
  numberOfRowsToWrite = DEFAULT_NUMBER_ROWS_TO_INSERT,
): Promise<number> {
  return new Promise(async function (resolve, reject) {
    let numberRowsParsed = 0;
    const promises: Promise<QueryArrayResult>[] = [];

    const fileStream = S3.getObject(s3Params).createReadStream();
    let pipeline = chain([
      fileStream,
      parser(),
      pick({ filter: 'features' }),
      streamArray(),
      new Batch({ batchSize: BATCH_SIZE }),
    ]);

    pipeline
      .on('data', async (rows: any[]) => {
        let tableRows: ViolationsTableRow[] = [];
        const endIndex = startIndex + numberOfRowsToWrite;
        if (numberRowsParsed >= startIndex && numberRowsParsed <= endIndex) {
          for (const row of rows) {
            const value = row.value;
            const properties = value.properties;

            // Skip violations outside of Lead and Copper Rule violations.
            if (LEAD_AND_COPPER_VIOLATIONS.has(properties[VIOLATION_CODE])) {
              const startDate = moment(properties[COMPL_PER_BEGIN_DATE], EPA_API_DATE_FORMAT);
              const endDate = moment(properties[COMPL_PER_END_DATE], EPA_API_DATE_FORMAT);
              const tableRowToInsert = new ViolationsTableRowBuilder()
                .violationId(properties[VIOLATION_ID])
                .pwsId(properties[PWSID])
                .violationCode(properties[VIOLATION_CODE])
                .complianceStatus(
                  COMPLIANCE_STATUS_MAP.get(properties[COMPLIANCE_STATUS_CODE]) ?? '',
                )
                .startDate(startDate.format(POSTGRESQL_DATE_FORMAT))
                .endDate(endDate.format(POSTGRESQL_DATE_FORMAT))
                .build();

              tableRows.push(tableRowToInsert);
            }
          }
        }

        numberRowsParsed += rows.length;
        console.log(`Parsed ${numberRowsParsed}`);
        executeBatchOfRows(db, tableRows, promises);

        // Stop reading stream if numberOfRowsToWrite has been met.
        if (numberRowsParsed > endIndex) {
          pipeline.destroy();
        }
      })
      .on('error', (error: Error) => {
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
  });
}

/**
 * Writes the table rows to the db and adds execution to list of promises.
 *
 * @param db: Database to write to.
 * @param tableRows: Rows to write to the db.
 * @param promises: List of promises collecting db executions.
 */
function executeBatchOfRows(
  db: PoolClient,
  tableRows: ViolationsTableRow[],
  promises: Promise<QueryArrayResult>[],
) {
  if (tableRows.length > 0) {
    const promise = insertRows(db, tableRows);
    promise.catch((_) => {}); // Suppress unhandled rejection.
    promises.push(promise);
  }
}

/**
 * Logs number and details of errors that occurred for all inserts.
 * @param promises of SQL executions.
 */
async function handleEndOfFilestream(promises: Promise<QueryArrayResult>[]) {
  const result = await Promise.allSettled(promises);
  const errors = result.filter((p) => p.status == 'rejected') as PromiseRejectedResult[];
  console.log(`Number errors during insert: ${errors.length}`);

  // Log all the rejected promises to diagnose issues.
  errors.forEach((error) => console.log('Insert error:', error.reason));
}

/**
 * Parses S3 'violations_by_water_system.geojson' file and writes rows
 * to violations table in the MainCluster postgres db.
 */
export async function handler(_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const numberRowsToWrite: number = parseInt(
    process.env.numberRows ?? `${DEFAULT_NUMBER_ROWS_TO_INSERT}`,
  );

  const startIndex = parseInt(process.env.startIndex ?? '0');

  const s3Params = {
    Bucket: 'opendataplatformapistaticdata',
    Key: 'violations_by_water_system.geojson',
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

    // Read CSV file and write to violations table.
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
  // Date the violation went back into compliance in the form of YYYY-mm-dd.
  // Could be null for ongoing violations.
  end_date: string | null;

  constructor(
    pws_id: string,
    violation_id: string,
    violation_code: string,
    compliance_status: string,
    start_date: string,
    end_date: string,
  ) {
    this.pws_id = pws_id;
    this.violation_id = violation_id;
    this.violation_code = violation_code;
    this.start_date = start_date;
    this.end_date = end_date;
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

  endDate(endDate: string): ViolationsTableRowBuilder {
    this._row.end_date = endDate;
    return this;
  }

  build(): ViolationsTableRow {
    return this._row;
  }
}
