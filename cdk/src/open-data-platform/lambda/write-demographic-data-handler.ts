// asset-input/src/open-data-platform/lambda/write-demographic-data-handler.js
import {Context, APIGatewayProxyCallback, APIGatewayEvent, Callback} from 'aws-lambda';

const AWS = require('aws-sdk');
const parse = require('csv-parser');
const S3 = new AWS.S3();
const rdsDataService = new AWS.RDSDataService();

const GEO_ID = 'GEOID';
const RACE_TOTAL = 'RaceTotal';
const WHITE_POPULATION = 'Estimate!!Total:!!White alone';
const BLACK_POPULATION = 'Estimate!!Total:!!Black or African American alone';

let createDemographicsTableStatement =
    'CREATE TABLE IF NOT EXISTS demographics( \n' +
    '   census_geo_id varchar(255) NOT NULL, \n' +
    '   total_population real, \n' +
    '   black_percentage real,\n' +
    '   white_percentage real, \n' +
    '   PRIMARY KEY(census_geo_id) \n' +
    ');';

/// Reads the S3 bucket object and returns parsed rows from the CSV file.
const readFile = (s3Params: Object): Promise<any> => {
  let results: PopulationTableRow[] = [];
  return new Promise(function (resolve, reject) {
    let count = 0;
    let fileStream = S3.getObject(s3Params).createReadStream();
    fileStream.pipe(parse()).on('data', (chunk) => {
      fileStream.pause();
      count += 1;
      // Only process 10 rows for now.
      if (count < 10) {
        let row = new PopulationTableRowBuilder()
            .censusGeoId(chunk[GEO_ID])
            .totalPopulation(parseInt(chunk[RACE_TOTAL]))
            .blackPopulation(parseInt(chunk[BLACK_POPULATION]))
            .whitePopulation(parseInt(chunk[WHITE_POPULATION]))
            .build();
        console.log(row);
        results.push(row);
      }
      fileStream.resume();
    }).on('error', (error) => {
      reject(error);
    }).on('end', () => {
      console.log('Parsed ' + results.length + ' rows.');
      resolve(results);
    });
  });
}

/// Parses rows and columns of SQL data.
const readSqlQuery = (data: Object): SqlData => {
  let rows: any[] = [];
  let cols: string[] = [];

  if (data.columnMetadata != undefined) {
    data.columnMetadata.map((value, _) => {
      cols.push(value.name);
    });
  }

  if (data.records != undefined) {
    data.records.map((record: Array<Object>) => {
      let row = {};
      record.map((value, index) => {
        if (value.stringValue !== 'undefined') {
          row[cols[index]] = value.stringValue;
        } else if (value.blobValue !== 'undefined') {
          row[cols[index]] = value.blobValue;
        } else if (value.doubleValue !== 'undefined') {
          row[cols[index]] = value.doubleValue;
        } else if (value.longValue !== 'undefined') {
          row[cols[index]] = value.longValue;
        } else if (value.booleanValue !== 'undefined') {
          row[cols[index]] = value.booleanValue;
        } else if (value.isNull) {
          row[cols[index]] = null;
        }
      });
      rows.push(row);
    });
    console.log('Found rows: ' + rows.length);
  }
  return {columns: cols, rows: rows};
}

/// Executes SQL statement passed in against the MainCluster db.
const executeSqlStatement = (secretArn: string, resourceArn: string, statement: string, callback: APIGatewayProxyCallback): void => {
  const db = 'postgres'; // Default db
  let sqlParams = {
    secretArn: secretArn,
    resourceArn: resourceArn,
    sql: statement,
    database: db,
    includeResultMetadata: true
  };

  rdsDataService.executeStatement(sqlParams, function (err: Error, data: Object) {
    if (err) {
      console.log(err);
      callback('Error: RDS statement failed to execute');
    } else {

      let sqlData = readSqlQuery(data);
      console.log('Data is: ');
      console.log(data);

      callback(null, {
        statusCode: 200,
        body: JSON.stringify(sqlData)
      });
    }
  });
}

/// Write demographic data handler.
exports.handler = (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback): void => {
  const s3Params = {
    Bucket: 'opendataplatformapistaticdata',
    Key: 'alabama_acs_data.csv'
  };

  readFile(s3Params).then(function (results) {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(results)
    });

  }).catch(function (err) {
    console.log('Error:' + err);
    callback(null, {
      statusCode: 502,
      body: JSON.stringify(err.message)
    });
  });

  let secretArn = 'arn:aws:secretsmanager:us-east-2:036999211278:secret:MainClusterSecretD2D17D33-Het1wBB6i4O7-kHd82A';
  let mainClusterArn = 'arn:aws:rds:us-east-2:036999211278:cluster:breuch-opendataplatformdatapl-maincluster834123e8-vsco0l3vde9y';

  executeSqlStatement(secretArn, mainClusterArn, createDemographicsTableStatement, callback);
};

interface SqlData {
  rows: any[],
  columns: string[]
}

interface PopulationTableRow {
  censusGeoId: string;
  totalPopulation: number;
  blackPopulation: number;
  whitePopulation: number;
}

/// Builder utility for rows of the Demographics table.
class PopulationTableRowBuilder {
  private readonly _row: PopulationTableRow;

  constructor() {
    this._row = {
      censusGeoId: '',
      totalPopulation: 0,
      blackPopulation: 0,
      whitePopulation: 0,
    };
  }

  censusGeoId(censusGeoId: string): PopulationTableRowBuilder {
    this._row.censusGeoId = censusGeoId;
    return this;
  }

  totalPopulation(totalPopulation: number): PopulationTableRowBuilder {
    this._row.totalPopulation = totalPopulation;
    return this;
  }

  blackPopulation(blackPopulation: number): PopulationTableRowBuilder {
    this._row.blackPopulation = blackPopulation;
    return this;
  }

  whitePopulation(whitePopulation: number): PopulationTableRowBuilder {
    this._row.whitePopulation = whitePopulation;
    return this;
  }

  /// Returns black population : total population.
  percentageBlackPopulation(): number {
    return this._row.blackPopulation / this._row.totalPopulation;
  }

  /// Returns white population : total population.
  percentageWhitePopulation(): number {
    return this._row.whitePopulation / this._row.totalPopulation;
  }

  build(): PopulationTableRow {
    return this._row;
  }
}
