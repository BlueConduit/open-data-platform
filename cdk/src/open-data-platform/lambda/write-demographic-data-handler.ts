// asset-input/src/open-data-platform/lambda/write-demographic-data-handler.js
import {SecretsManager} from '@aws-sdk/client-secrets-manager';
import createConnectionPool, {ConnectionPool, ConnectionPoolConfig, Queryable, sql} from '@databases/pg';
import {bulkInsert, BulkOperationOptions} from '@databases/pg-bulk';
import {APIGatewayEvent} from 'aws-lambda';

const AWS = require('aws-sdk');
const parse = require('csv-parser');
const S3 = new AWS.S3();
const secretsmanager = new SecretsManager({})

const GEO_ID = 'GEOID';
const RACE_TOTAL = 'RaceTotal';
const WHITE_POPULATION = 'Estimate!!Total:!!White alone';
const BLACK_POPULATION = 'Estimate!!Total:!!Black or African American alone';

// Establishes connection with DB with the given ARN.
function connectToDb(secretArn: string): Promise<ConnectionPool> {
  return new Promise(async function(resolve, reject) {
    try {
      console.log('Fetching db credentials...');
      const secretInfo =
          await secretsmanager.getSecretValue({SecretId: secretArn});
      const {host, port, username, password} =
          JSON.parse(secretInfo.SecretString!);

      const config: ConnectionPoolConfig = {
        host: host,
        port: port,
        user: username,
        password: password,
      };

      console.log('Connecting to database...');
      let connectionsCount = 0;

      let pool = createConnectionPool({
        ...config,
        onError: (err: Error) => {
            console.log(`${new Date().toISOString()} ERROR - ${err.message}`)},
        onConnectionOpened: () => {
          console.log(
              `Opened connection. Active connections = ${++connectionsCount}`,
          );
        },
        onConnectionClosed: () => {
          console.log(
              `Closed connection. Active connections = ${--connectionsCount}`,
          );
        },
        onQueryStart: (_query, {text, values}) => {
          console.log(
              `${new Date().toISOString()} START QUERY ${text} - ${
                  JSON.stringify(
                      values,
                      )}`,
          );
        },
        onQueryResults: (_query, {text}, results) => {
          console.log(
              `${new Date().toISOString()} END QUERY   ${text} - ${
                  results.length} results`,
          );
        },
        onQueryError: (_query, {text}, err) => {
          console.log(
              `${new Date().toISOString()} ERROR QUERY ${text} - ${
                  err.message}`,
          );
        },
      });
      console.log('Finished connecting to database...');
      resolve(pool);
    } catch (error) {
      reject(error);
    }
  });
}

// Inserts all rows into the demographics table.
async function insertRows(
    db: Queryable, rows: DemographicsTableRow[]): Promise<any[]> {
  const rowOptions:
      BulkOperationOptions<'census_geo_id'|'total_population'|
                           'black_percentage'|'white_percentage'> = {
        database: db,
        tableName: `demographics`,
        columnTypes: {
          census_geo_id: sql`VARCHAR`,
          total_population: sql`REAL`,
          black_percentage: sql`REAL`,
          white_percentage: sql`REAL`,
        },
      };

  return Promise.all([bulkInsert({
    ...rowOptions,
    columnsToInsert: [
      `census_geo_id`, `total_population`, `black_percentage`,
      `white_percentage`
    ],
    records: rows,
  })]);
}

// Inserts all rows into the demographics table.
async function deleteRows(db: Queryable): Promise<any[]> {
  return db.query(sql`DELETE
          FROM demographics
          WHERE census_geo_id IS NOT NULL`);
}

// Reads the S3 CSV file and returns [DemographicsTableRow]s.
function parseS3IntoDemographicsTableRow(
    s3Params: Object,
    numberRowsToWrite = 10): Promise<Array<DemographicsTableRow>> {
  const results: DemographicsTableRow[] = [];
  return new Promise(function(resolve, reject) {
    let count = 0;
    const fileStream = S3.getObject(s3Params).createReadStream();
    fileStream.pipe(parse())
        .on('data',
            (dataRow) => {
              // Pause to allow for processing.
              fileStream.pause();
              // Only process 10 rows for now.
              if (count < numberRowsToWrite) {
                const row =
                    new DemographicsTableRowBuilder()
                        .censusGeoId(dataRow[GEO_ID])
                        .totalPopulation(parseInt(dataRow[RACE_TOTAL]))
                        .blackPopulation(parseInt(dataRow[BLACK_POPULATION]))
                        .whitePopulation(parseInt(dataRow[WHITE_POPULATION]))
                        .build();
                results.push(row);
              }
              count += 1;
              fileStream.resume();
            })
        .on('error',
            (error: Error) => {
              reject(error);
            })
        .on('end', () => {
          console.log('Parsed ' + results.length + ' rows.');
          resolve(results);
        });
  });
}

/*
 * Parses S3 'alabama_acs_data.csv' file and writes rows
 * to demographics table in the MainCluster postgres db.
 */
exports.handler = async(event: APIGatewayEvent): Promise<Object> => {
  return new Promise(async function(resolve, reject) {
    const secretArn: string = event['secretArn'];
    const numberRowsToWrite: number = event['numberRows'];

    const s3Params = {
      Bucket: 'opendataplatformapistaticdata',
      Key: 'alabama_acs_data.csv'
    };

    let db: ConnectionPool|undefined;

    // Read CSV file and write to demographics table.
    try {
      const rows =
          await parseS3IntoDemographicsTableRow(s3Params, numberRowsToWrite);
      console.log('Found rows: ' + JSON.stringify(rows));

      db = await connectToDb(secretArn);

      // Remove existing rows before inserting new ones.
      await deleteRows(db);
      const data = await insertRows(db, rows);
      resolve({statusCode: 200, body: JSON.stringify(data)});

    } catch (error) {
      console.log('Error:' + JSON.stringify(error));
      reject({statusCode: 500, body: JSON.stringify(error.message)});

    } finally {
      console.log('Disconnecting from db...');
      await db?.dispose();
    }
  });
};

// Single row for demographics table.
class DemographicsTableRow {
  // Field formatting conforms to rows in the db. Requires less tranformations.
  census_geo_id: string;
  total_population: number;
  black_population: number;
  white_population: number;

  constructor(
      censusGeoId: string, totalPopulation: number, blackPopulation: number,
      whitePopulation: number) {
    this.census_geo_id = censusGeoId;
    this.total_population = totalPopulation;
    this.black_population = blackPopulation;
    this.white_population = whitePopulation;
  }

  // Returns black population : total population.
  get black_percentage(): number {
    if (this.total_population == 0 || this.black_population == 0) {
      return 0;
    }
    return this.black_population / this.total_population;
  }

  // Returns white population : total population.
  get white_percentage(): number {
    if (this.total_population == 0 || this.white_population == 0) {
      return 0;
    }
    return this.white_population / this.total_population;
  }
}

// Builder utility for rows of the Demographics table.
class DemographicsTableRowBuilder {
  private readonly _row: DemographicsTableRow;

  constructor() {
    this._row = new DemographicsTableRow('', 0, 0, 0);
  }

  censusGeoId(censusGeoId: string): DemographicsTableRowBuilder {
    this._row.census_geo_id = censusGeoId;
    return this;
  }

  totalPopulation(totalPopulation: number): DemographicsTableRowBuilder {
    this._row.total_population = totalPopulation;
    return this;
  }

  blackPopulation(blackPopulation: number): DemographicsTableRowBuilder {
    this._row.black_population = blackPopulation;
    return this;
  }

  whitePopulation(whitePopulation: number): DemographicsTableRowBuilder {
    this._row.white_population = whitePopulation;
    return this;
  }

  build(): DemographicsTableRow {
    return this._row;
  }
}
