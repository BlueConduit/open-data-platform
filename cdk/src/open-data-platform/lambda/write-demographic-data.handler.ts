// asset-input/src/open-data-platform/lambda/write-demographic-data-handler.js
import {SecretsManager} from '@aws-sdk/client-secrets-manager';
import createConnectionPool, {ConnectionPool, ConnectionPoolConfig, Queryable, sql} from '@databases/pg';
import {bulkInsert, bulkInsertOrUpdate, BulkOperationOptions} from '@databases/pg-bulk';
import {APIGatewayEvent} from 'aws-lambda';

const AWS = require('aws-sdk');
const parse = require('csv-parser');
const S3 = new AWS.S3();
const secretsmanager = new SecretsManager({})

const GEO_ID = 'GEOID';
const RACE_TOTAL = 'RaceTotal';
const WHITE_POPULATION = 'Estimate!!Total:!!White alone';
const BLACK_POPULATION = 'Estimate!!Total:!!Black or African American alone';

/**
 * Establishes connection with DB with the given ARN.
 */
async function connectToDb(secretArn: string): Promise<ConnectionPool> {
  console.log('Fetching db credentials...');
  const secretInfo = await secretsmanager.getSecretValue({SecretId: secretArn});
  const {host, port, username, password} = JSON.parse(secretInfo.SecretString!);

  const config: ConnectionPoolConfig = {
    host,
    port,
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
          `${new Date().toISOString()} ERROR QUERY ${text} - ${err.message}`,
      );
    },
  });
  console.log('Finished connecting to database...');
  return pool;
}

/**
 * Inserts all rows into the demographics table.
 */
async function insertRows(
    db: Queryable, rows: DemographicsTableRow[]): Promise<any[]> {
  const census_geo_id = rows[0].census_geo_id;
  const total_population = rows[0].total_population;
  const black_percentage = rows[0].black_percentage;
  const white_percentage = rows[0].white_percentage;

  const geometry = sql.__dangerous__rawValue('ST_GeometryFromText(\'POLYGON((-122.76199734299996 47.34350314200003, -122.76248119999997 47.342854930000044, -122.76257080699997 47.34285604200005, -122.76259517499994 47.34266843300003, -122.76260856299996 47.34256536000004, -122.76286629299995 47.34250175600005, -122.76295867599998 47.34242223000007, -122.76328431199994 47.34202772300006, -122.763359015 47.34188063000005, -122.76359184199998 47.34185498100004, -122.76392923599997 47.34181781500007, -122.76392897999995 47.34183731100006, -122.76390878299998 47.341839519000075, -122.76390520999996 47.34211214900006, -122.76390440899996 47.342173262000074, -122.763924584 47.34217272700005, -122.763921139 47.342407894000075, -122.76391819399998 47.342471904000035, -122.76390565499997 47.34257032900007, -122.76390536899999 47.342571914000075, -122.76388240099999 47.34267173100005, -122.76388191899997 47.34267343500005, -122.76386218299996 47.34273572600006, -122.76383851199995 47.34279737900005, -122.76383805499995 47.34279846700008, -122.76380443699998 47.34287143500006, -122.76376811299997 47.34293827000005, -122.763727072 47.343003846000045, -122.76372118599994 47.34301258000005, -122.763375968 47.34352033700003, -122.76328781999996 47.343519239000045, -122.76310988499995 47.343517020000036, -122.76199734299996 47.34350314200003))\')');

  return db.query(sql`INSERT INTO demographics (census_geo_id, total_population, black_percentage, white_percentage, geom) 
  VALUES (${census_geo_id}, 
          ${total_population}, 
          ${black_percentage}, 
          ${white_percentage}, 
          ${geometry});`);
}

/**
 * Inserts all rows into the demographics table.
 */
async function deleteRows(db: Queryable): Promise<any[]> {
  return db.query(sql`DELETE
          FROM demographics
          WHERE census_geo_id IS NOT NULL`);
}

/**
 * Reads the S3 CSV file and returns [DemographicsTableRow]s.
 */
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

/**
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
      console.log('Error:' + error);
      reject({statusCode: 500, body: JSON.stringify(error.message)});

    } finally {
      console.log('Disconnecting from db...');
      await db?.dispose();
    }
  });
};

/**
 * Single row for demographics table.
 */
class DemographicsTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.
  census_geo_id: string;
  total_population: number;
  black_population: number;
  white_population: number;
  geom: string;

  constructor(
      censusGeoId: string, totalPopulation: number, blackPopulation: number,
      whitePopulation: number, geom: string) {
    this.census_geo_id = censusGeoId;
    this.total_population = totalPopulation;
    this.black_population = blackPopulation;
    this.white_population = whitePopulation;
    this.geom = geom;
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

/**
 * Builder utility for rows of the Demographics table.
 */
class DemographicsTableRowBuilder {
  private readonly _row: DemographicsTableRow;

  constructor() {
    this._row = new DemographicsTableRow('', 0, 0, 0, '');
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
