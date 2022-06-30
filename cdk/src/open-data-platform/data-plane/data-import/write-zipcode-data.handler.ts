import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import { geoJsonHandlerFactory } from './handler-factory';
import { CountiesTableRowBuilder } from '../model/county_table';
import { ZipcodeTableRowBuilder } from '../model/zipcode_table';

// As of 2022-06-29, this should have 33,792 rows.
const s3Params = {
  Bucket: 'opendataplatformapistaticdata',
  Key: 'cb_2020_us_zcta520_500k.geojson',
};

const SCHEMA = 'public';

/**
 * Writes rows into the zipcodes table.
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
    sql: `INSERT INTO zipcodes (census_geo_id,
                                zipcode,
                                lsad,
                                aff_geo_id,
                                geom)
          VALUES (:census_geo_id,
                  :zipcode,
                  :lsad,
                  :aff_geo_id,
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
    new ZipcodeTableRowBuilder()
      .censusGeoId(properties.GEOID20)
      .zipcode(properties.ZCTA5CE20)
      .affGeoId(properties.AFFGEOID ?? '')
      .lsad(properties.LSAD20)
      // Keep JSON formatting. Post-GIS helpers depend on this.
      .geom(JSON.stringify(value.geometry))
      .build()
  );
}

/**
 * Parses S3 'cb_2020_us_zcta520_500k.geojson' file and writes rows
 * to zipcodes table in the MainCluster postgres db.
 */
export const handler = geoJsonHandlerFactory(
  s3Params,
  async (rows: any[], rdsDataService: RDSDataService) => {
    await insertBatch(rdsDataService, rows.map(getTableRowFromRow));
  },
);
