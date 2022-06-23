// asset-input/src/open-data-platform/lambda/write-demographic-data-handler.js
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, BatchExecuteStatementResponse, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

// We have to import it this way, otherwise typescript doesn't like using it as a function.
const parse = require('csv-parser');
const { chain } = require('stream-chain');
const { ignore } = require('stream-json/filters/Ignore');
const { pick } = require('stream-json/filters/Pick');
const { parser } = require('stream-json/Parser');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Batch = require('stream-json/utils/Batch');

const S3 = new AWS.S3();

// Number of rows to write at once.
const BATCH_SIZE = 10;

/**
 *  Writes rows into the demographics table.
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
    sql: `INSERT INTO demographics (census_geo_id, total_population,
                                    under_five_population, poverty_total,
                                    black_percentage,
                                    white_percentage, geom)
          VALUES (:census_geo_id,
                  :total_population,
                  :under_five_population,
                  :poverty_total,
                  :black_percentage,
                  :white_percentage,
                  ST_AsText(ST_GeomFromGeoJSON(:geom))) ON CONFLICT (census_geo_id) DO NOTHING`,
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

  // TODO(kailamjeter): modify field names when file is fixed.
  return (
    new DemographicsTableRowBuilder()
      .censusGeoId(properties.GEOID)
      .underFivePopulation(getValueOrDefault(properties.age_under5))
      .povertyTotal(getValueOrDefault(properties.PovertyTot))
      .totalPopulation(getValueOrDefault(properties.RaceTotal))
      .blackPopulation(getValueOrDefault(properties.Estimate_1))
      .whitePopulation(getValueOrDefault(properties.Estimate!!)) // This converts to 'Estimate' when minified so this is always null as of now.
      // Keep JSON formatting. Post-GIS helpers depend on this.
      .geom(JSON.stringify(value.geometry))
      .build()
  );
}

/**
 * Reads the S3 CSV file and returns [DemographicsTableRow]s.
 */
function parseS3IntoDemographicsTableRow(
  s3Params: AWS.S3.GetObjectRequest,
  rdsDataService: RDSDataService,
  startIndex = 0,
  numberOfRowsToWrite = 10,
): Promise<number> {
  return new Promise(function(resolve, reject) {
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
        .on('data', (rows: any[]) => {
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
    promise.catch((_) => {
    }); // Suppress unhandled rejection.
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
 * Parses S3 'alabama_acs_data.csv' file and writes rows
 * to demographics table in the MainCluster postgres db.
 */
export async function handler(_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const numberRowsToWrite = 10; // TODO use env variable.
  const startIndex = 0; // TODO remove once files are split.

  const s3Params = {
    Bucket: 'opendataplatformapistaticdata',
    // TODO replace with broken up file
    Key: 'blocks_acs_geo_smaller.json',
  };

  // Read CSV file and write to demographics table.
  try {
    // See https://docs.aws.amazon.com/rds/index.html.
    const rdsService = new AWS.RDSDataService();

    const numberRows = await parseS3IntoDemographicsTableRow(
      s3Params,
      rdsService,
      startIndex,
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
 * Single row for demographics table.
 */
class DemographicsTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.
  census_geo_id: string;
  under_five_population: number;
  poverty_total: number;
  total_population: number;
  black_population: number;
  white_population: number;
  geom: string;

  constructor(
    censusGeoId: string,
    totalPopulation: number,
    blackPopulation: number,
    whitePopulation: number,
    geom: string,
  ) {
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

  underFivePopulation(underFivePopulation: number): DemographicsTableRowBuilder {
    this._row.under_five_population = underFivePopulation;
    return this;
  }

  povertyTotal(povertyTotal: number): DemographicsTableRowBuilder {
    this._row.poverty_total = povertyTotal;
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

  geom(geom: string): DemographicsTableRowBuilder {
    this._row.geom = geom;
    return this;
  }

  // TODO clarify these are the right types (double?)
  build(): SqlParametersList {
    return [
      {
        name: 'census_geo_id',
        value: { stringValue: this._row.census_geo_id.toString() },
      },
      {
        name: 'total_population',
        value: { doubleValue: this._row.total_population },
      },
      {
        name: 'under_five_population',
        value: { doubleValue: this._row.under_five_population },
      },
      {
        // TODO(kailamjeter) make this a percentage
        name: 'poverty_total',
        value: { doubleValue: this._row.poverty_total },
      },
      {
        name: 'black_percentage',
        value: { doubleValue: this._row.black_percentage },
      },
      {
        name: 'white_percentage',
        value: { doubleValue: this._row.white_percentage },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom.toString() },
      },
    ];
  }
}
