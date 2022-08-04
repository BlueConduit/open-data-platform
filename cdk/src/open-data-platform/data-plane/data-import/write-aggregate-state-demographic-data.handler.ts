import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import { geoJsonHandlerFactory } from './handler-factory';
import { AggregateUsDemographicTableRowBuilder, GeoType } from '../model/aggregate_us_demographic_table';

// As of 2022-08-02, this should have 39,759 rows.
const s3Params = {
  Bucket: 'opendataplatformapistaticdata/demographics',
  Key: 'state_demographics.geojson',
};

const SCHEMA = 'public';

/**
 * Writes rows into the aggregate US demographics table for counties.
 *
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
    sql: `INSERT INTO aggregate_us_demographics (census_geo_id,
                                                 geo_type,
                                                 name,
                                                 median_year_built,
                                                 median_income,
                                                 home_age_index,
                                                 income_index,
                                                 weighted_national_adi,
                                                 weighted_state_adi,
                                                 population_count,
                                                 geom)
          VALUES (:census_geo_id,
                  :geo_type,
                  :name,
                  :median_year_built,
                  :median_income,
                  :home_age_index,
                  :income_index,
                  :weighted_national_adi,
                  :weighted_state_adi,
                  :population_count,
                  ST_AsText(ST_GeomFromGeoJSON(:geom))) ON CONFLICT (census_geo_id) DO NOTHING`,
  };
  return rdsService.batchExecuteStatement(batchExecuteParams).promise();
}

/**
 * Maps a data row to a table row ready to write to the db.
 * @param row: row with all data needed to build a [AggregateUsDemographicTableRow].
 */
function getTableRowFromRow(row: any): SqlParametersList {
  const value = row.value;
  const properties = value.properties;
  return (
    new AggregateUsDemographicTableRowBuilder()
      // Substring of AFFGEOID which is just state census geo ID.
      .censusGeoId(properties.AFFGEOID?.substring(9, 14))
      .geoType(GeoType.State)
      .name(properties.NAME)
      .medianYearBuilt(properties.median_yearbuilt ?? '')
      .medianIncome(properties.median_income ?? 0)
      .homeAgeIndex(properties.homeage_index ?? 0)
      .incomeIndex(properties.income_index ?? 0)
      .weightedNationalAdi(properties.weighted_nat_adi ?? 0)
      .weightedStateAdi(properties.weighted_state_adi ?? 0)
      .populationCount(properties.RaceTotal ?? 0)
      // Keep JSON formatting. Post-GIS helpers depend on this.
      .geom(JSON.stringify(value.geometry))
      .build()
  );
}

/**
 * Parses S3 'state_demographics.geojson' file and writes rows
 * to aggregate_us_demographics table in the MainCluster postgres db.
 */
export const handler = geoJsonHandlerFactory(
  s3Params,
  async (rows: any[], rdsDataService: RDSDataService) => {
    await insertBatch(rdsDataService, rows.map(getTableRowFromRow));
  },
);
