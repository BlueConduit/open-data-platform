// asset-input/src/open-data-platform/lambda/write-demographic-data-handler.js
import {APIGatewayEvent, APIGatewayProxyCallback, Context} from 'aws-lambda';

const AWS = require('aws-sdk');
const parse = require('csv-parser');
const S3 = new AWS.S3();
const rdsDataService = new AWS.RDSDataService();

const GEO_ID = 'GEOID';
const RACE_TOTAL = 'RaceTotal';
const WHITE_POPULATION = 'Estimate!!Total:!!White alone';
const BLACK_POPULATION = 'Estimate!!Total:!!Black or African American alone';

// Prepared SQL statements.
const DELETE_DEMOGRAPHICS_TABLE =
  'DELETE FROM demographics WHERE census_geo_id IS NOT NULL';

// Reads the S3 CSV file and returns [DemographicsTableRow]s.
const parseS3IntoDemographicsTableRow =
  (s3Params: Object): Promise<Array<DemographicsTableRow>> => {
    const results: DemographicsTableRow[] = [];
    return new Promise(function (resolve, reject) {
      let count = 0;
      const fileStream = S3.getObject(s3Params).createReadStream();
      fileStream.pipe(parse())
                .on('data',
                  (chunk) => {
                    // Pause to allow for processing.
                    fileStream.pause();
                    // Only process 10 rows for now.
                    if (count < 10) {
                      const row =
                        new DemographicsTableRowBuilder()
                          .censusGeoId(chunk[GEO_ID])
                          .totalPopulation(parseInt(chunk[RACE_TOTAL]))
                          .blackPopulation(parseInt(chunk[BLACK_POPULATION]))
                          .whitePopulation(parseInt(chunk[WHITE_POPULATION]))
                          .build();
                      count += 1;
                      results.push(row);
                    }
                    fileStream.resume();
                  })
                .on('error',
                  (error) => {
                    reject(error);
                  })
                .on('end', () => {
                  console.log('Parsed ' + results.length + ' rows.');
                  resolve(results);
                });
    });
  }

// Executes SQL statement argument against the MainCluster db.
const executeSqlStatement = async (secretArn: string, resourceArn: string,
                                   statement: string,
                                   db: String | undefined): Promise<Object> => {
  return new Promise(async function (resolve, reject) {
    const sqlParams = {
      secretArn: secretArn,
      resourceArn: resourceArn,
      sql: statement,
      database: db ?? 'postgres',  // Default db
      includeResultMetadata: true
    };

    await rdsDataService.executeStatement(sqlParams,
      function (err: Error, data: Object) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log('Data is: ' + data);
          resolve(data);
        }
      });
  });
}
// Formats a [DemographicsTableRow] as SQL row.
const formatPopulationTableRowAsSql = (row: DemographicsTableRow): string => {
  const singleValue = [
    row.censusGeoId, row.totalPopulation, row.percentageBlackPopulation(),
    row.percentageWhitePopulation()
  ];
  return '(' + singleValue.join(',') + ')';
}

// Parses S3 'alabama_acs_data.csv' file and writes rows to demographics
// table in the MainCluster postgres db.
exports.handler = async (event: APIGatewayEvent): Promise<Object> => {
  return new Promise(async function (resolve, reject) {
    const secretArn = event['secretArn'];
    const mainClusterArn = event['mainClusterArn'];

    const s3Params = {
      Bucket: 'opendataplatformapistaticdata',
      Key: 'alabama_acs_data.csv'
    };

    // Read CSV file and write to demographics table.
    try {
      let rows = await parseS3IntoDemographicsTableRow(s3Params);
      const valuesForSql = rows.map(formatPopulationTableRowAsSql);

      const insertRowsIntoDemographicsTableStatement =
        'INSERT INTO demographics  \n' +
        '(census_geo_id, total_population, black_percentage, white_percentage) \n' +
        'VALUES \n' + valuesForSql.join(', ') + '; \n';

      console.log(
        'Running statement: ' +
        insertRowsIntoDemographicsTableStatement);

      let data = await executeSqlStatement(
        secretArn, mainClusterArn,
        insertRowsIntoDemographicsTableStatement, 'postgres');

      resolve({statusCode: 200, body: JSON.stringify(data)});

    } catch (error) {
      console.log('Error:' + error);
      reject({statusCode: 500, body: JSON.stringify(error.message)});
    }
  });
};

// Single row for demographics table.
class DemographicsTableRow {
  censusGeoId: string;
  totalPopulation: number;
  blackPopulation: number;
  whitePopulation: number;

  constructor(
    censusGeoId: string, totalPopulation: number, blackPopulation: number,
    whitePopulation: number) {
    this.censusGeoId = censusGeoId;
    this.totalPopulation = totalPopulation;
    this.blackPopulation = blackPopulation;
    this.whitePopulation = whitePopulation;
  }

  // Returns black population : total population.
  percentageBlackPopulation(): number {
    return this.blackPopulation / this.totalPopulation;
  }

  // Returns white population : total population.
  percentageWhitePopulation(): number {
    return this.whitePopulation / this.totalPopulation;
  }
}

// Builder utility for rows of the Demographics table.
class DemographicsTableRowBuilder {
  private readonly _row: DemographicsTableRow;

  constructor() {
    this._row = new DemographicsTableRow('', 0, 0, 0);
  }

  censusGeoId(censusGeoId: string): DemographicsTableRowBuilder {
    this._row.censusGeoId = censusGeoId;
    return this;
  }

  totalPopulation(totalPopulation: number): DemographicsTableRowBuilder {
    this._row.totalPopulation = totalPopulation;
    return this;
  }

  blackPopulation(blackPopulation: number): DemographicsTableRowBuilder {
    this._row.blackPopulation = blackPopulation;
    return this;
  }

  whitePopulation(whitePopulation: number): DemographicsTableRowBuilder {
    this._row.whitePopulation = whitePopulation;
    return this;
  }

  build(): DemographicsTableRow {
    return this._row;
  }
}

// Retrieved data from a SQL query.
interface SqlData {
  rows: any[],
  columns: string[]
}