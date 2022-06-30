import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import { geoJsonHandlerFactory } from './handler-factory';
import { WaterSystemsTableRowBuilder } from '../model/water-systems-table';

// As of 2022-06-27, this should have 26010 rows.
const s3Params = {
  Bucket: 'opendataplatformapistaticdata',
  Key: 'pwsid_lead_connections_even_smaller.geojson',
};

const SCHEMA = 'public';

/**
 *  Writes rows into the water systems table.
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
    sql: `INSERT INTO water_systems (pws_id,
                                     pws_name,
                                     lead_connections_count,
                                     service_connections_count,
                                     population_served,
                                     geom)
          VALUES (:pws_id,
                  :pws_name,
                  :lead_connections_count,
                  :service_connections_count,
                  :population_served,
                  ST_AsText(ST_GeomFromGeoJSON(:geom))) ON CONFLICT (pws_id) DO NOTHING`,
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
  return (
    new WaterSystemsTableRowBuilder()
      .pwsId(properties.pwsid)
      .pwsName(properties.pws_name ?? '')
      .leadConnectionsCount(getValueOrDefault(properties.lead_connections))
      .serviceConnectionsCount(getValueOrDefault(properties.service_connections_count))
      .populationServed(getValueOrDefault(properties.population_served_count))
      // Keep JSON formatting. Post-GIS helpers depend on this.
      .geom(JSON.stringify(value.geometry))
      .build()
  );
}

/**
 * Parses S3 'pwsid_lead_connections_even_smaller.geojson' file and writes rows
 * to water systems table in the MainCluster postgres db.
 */
export const handler = geoJsonHandlerFactory(
  s3Params,
  async (rows: any[], rdsDataService: RDSDataService) => {
    await insertBatch(rdsDataService, rows.map(getTableRowFromRow));
  },
);
