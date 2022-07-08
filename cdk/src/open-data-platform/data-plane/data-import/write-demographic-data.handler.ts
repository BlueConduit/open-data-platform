import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import { DemographicsTableRowBuilder } from '../model/demographic-table';
import { geoJsonHandlerFactory } from './handler-factory';

const s3Params = {
  Bucket: 'opendataplatformapistaticdata/demographics',
  // There are 5 total files containing demographic data. Replace '0' here with any number between
  // 0 and 4 (inclusive).
  Key: 'block_acs_data_0.geojson',
};

// Schema name where table lives.
const SCHEMA = 'public';

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
    schema: SCHEMA,
    secretArn: process.env.CREDENTIALS_SECRET ?? '',
    sql: `INSERT INTO demographics (census_geo_id,
                                    state_census_geo_id,
                                    county_census_geo_id,
                                    census_block_name,
                                    total_population,
                                    under_five_population, 
                                    poverty_population,
                                    black_population,
                                    white_population, geom)
          VALUES (:census_geo_id,
                  :state_census_geo_id,
                  :census_county_geo_id,
                  :county_census_geo_id,
                  :total_population,
                  :under_five_population,
                  :poverty_population,
                  :black_population,
                  :white_population,
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
 * @param row: row with all data needed to build a [DemographicsTableRow].
 */
function getTableRowFromRow(row: any): SqlParametersList {
  const value = row.value;
  const properties = value.properties;
  const geoId = properties.GEOID.toString();

  return (
    new DemographicsTableRowBuilder()
      .censusGeoId(geoId)
      // Indexes based on:
      // https://www.census.gov/programs-surveys/geography/guidance/geo-identifiers.html
      .stateCensusGeoId(geoId.substring(0, 2))
      .countyCensusGeoId(geoId.substring(0, 5))
      .name(properties.NAME)
      .underFivePopulation(getValueOrDefault(properties.age_under5))
      .povertyPopulation(getValueOrDefault(properties.PovertyTot))
      .totalPopulation(getValueOrDefault(properties.RaceTotal))
      .blackPopulation(getValueOrDefault(properties.black_population))
      .whitePopulation(getValueOrDefault(properties.white_population))
      // Keep JSON formatting. Post-GIS helpers depend on this.
      .geom(JSON.stringify(value.geometry))
      .build()
  );
}

/**
 * Parses S3 'opendataplatformapistaticdata/demographics' files and writes rows
 * to demographics table in the MainCluster postgres db.
 */
export const handler = geoJsonHandlerFactory(
  s3Params,
  async (rows: any[], rdsDataService: RDSDataService) => {
    await insertBatch(rdsDataService, rows.map(getTableRowFromRow));
  },
);
