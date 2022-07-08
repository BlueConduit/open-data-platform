import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import { geoJsonHandlerFactory } from './handler-factory';
import { CountiesTableRowBuilder } from '../model/county_table';

// As of 2022-06-29, this should have 3234 rows.
const s3Params = {
  Bucket: 'opendataplatformapistaticdata',
  Key: 'cb_2021_us_county_500k.geojson',
};

const SCHEMA = 'public';

/**
 *  Writes rows into the counties table.
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
    sql: `INSERT INTO counties (census_geo_id,
                               fips,
                               state_fips,
                               ansi,
                               aff_geo_id,
                               name,
                               lsad,
                               geom)
          VALUES (:census_geo_id,
                  :fips,
                  :state_fips,
                  :ansi,
                  :aff_geo_id,
                  :name,
                  :lsad,
                  ST_AsText(ST_GeomFromGeoJSON(:geom))) ON CONFLICT (census_geo_id) DO NOTHING`,
  };
  return rdsService.batchExecuteStatement(batchExecuteParams).promise();
}

/**
 * Maps a data row to a table row ready to write to the db.
 * @param row: row with all data needed to build a [CountiesTableRow].
 */
function getTableRowFromRow(row: any): SqlParametersList {
  const value = row.value;
  const properties = value.properties;

  return (
    new CountiesTableRowBuilder()
      .censusGeoId(properties.GEOID)
      .fips(properties.COUNTYFP)
      .stateFips(properties.STATEFP)
      .affGeoId(properties.AFFGEOID ?? '')
      .ansi(properties.COUNTYNS)
      .name(properties.NAME)
      .lsad(properties.LSAD)
      // Keep JSON formatting. Post-GIS helpers depend on this.
      .geom(JSON.stringify(value.geometry))
      .build()
  );
}

/**
 * Parses S3 'cb_2021_us_county_500k.geojson' file and writes rows
 * to counties table in the MainCluster postgres db.
 */
export const handler = geoJsonHandlerFactory(
  s3Params,
  async (rows: any[], rdsDataService: RDSDataService) => {
    await insertBatch(rdsDataService, rows.map(getTableRowFromRow));
  },
);
