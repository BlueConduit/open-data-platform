import { RDSDataService } from 'aws-sdk';
import {
  BatchExecuteStatementRequest,
  ExecuteStatementRequest,
  SqlParametersList,
} from 'aws-sdk/clients/rdsdataservice';
import { geoJsonHandlerFactory } from './handler-factory';
import { WaterSystemsTableRowBuilder } from '../model/water-systems-table';

// As of 2022-08-23, this should have 44261 rows.
const s3Params = {
  Bucket: 'opendataplatformapistaticdata',
  Key: 'cleaned_water_systems.geojson',
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
                                     is_estimated,
                                     lead_connections_count,
                                     service_connections_count,
                                     population_served,
                                     state_census_geo_id,
                                     geom)
          SELECT :pws_id,
                 :pws_name,
                 :is_estimated,
                 :lead_connections_count,
                 :service_connections_count,
                 :population_served,
                 s.census_geo_id,
                 ST_AsText(ST_GeomFromGeoJSON(:geom))
          FROM states s
          WHERE s.usps like
                SUBSTRING(:pws_id, 1, 2) ON CONFLICT (pws_id) DO NOTHING`,
  };
  return rdsService.batchExecuteStatement(batchExecuteParams).promise();
}

/**
 * Idempotently reorders the physical table data on disk according to its proximity within the index.
 * Reduces the number of disk seeks when fetching data that's closer together in the index, which
 * makes access much faster. Needs to be rerun as more data is added to the table. Locks the table for
 * access while running. When testing on water_systems with ~25k rows, this takes about 2.5 seconds.
 * See: https://www.postgresql.org/docs/current/sql-cluster.html for detailed info.
 * @param rdsService : RDS service to connect to the db.
 */
async function clusterRows(
  rdsService: RDSDataService,
): Promise<RDSDataService.ExecuteStatementResponse> {
  const executeClusterCommand: ExecuteStatementRequest = {
    database: process.env.DATABASE_NAME ?? 'postgres',
    resourceArn: process.env.RESOURCE_ARN ?? '',
    schema: SCHEMA,
    secretArn: process.env.CREDENTIALS_SECRET ?? '',
    sql: `CLUSTER water_systems_geom_idx ON water_systems; `,
  };
  return rdsService.executeStatement(executeClusterCommand).promise();
}

/**
 * Sometimes these fields are negative because they are based on a regression.
 */
function getValueOrDefault(field: string): number | undefined {
  if (field == 'NaN' || field == null) {
    return undefined;
  }
  return Math.max(parseFloat(field), 0);
}

/**
 * Maps a data row to a table row ready to write to the db.
 * @param row: row with all data needed to build a [WaterSystemsTableRow].
 */
function getTableRowFromRow(row: any): SqlParametersList | null {
  const value = row.value;
  const properties = value.properties;

  if (value.geometry == null) {
    return null;
  }

  let leadConnectionsCount = getValueOrDefault(properties.lead_connections_count);

  // If there is a reported lead count, use that
  const leadCountIsNotReported = leadConnectionsCount == null || leadConnectionsCount < 0;
  const lowEstimate = getValueOrDefault(properties.low);
  const highEstimate = getValueOrDefault(properties.high);
  if (leadCountIsNotReported && lowEstimate != null && highEstimate != null) {
    // TODO: Switch to storing low, high in db.
    leadConnectionsCount = (lowEstimate + highEstimate) / 2;
  }
  return (
    new WaterSystemsTableRowBuilder()
      .pwsId(properties.pwsid)
      .pwsName(properties.pws_name ?? '')
      .isEstimated(leadCountIsNotReported)
      .leadConnectionsCount(leadConnectionsCount)
      .serviceConnectionsCount(getValueOrDefault(properties.service_connections_count))
      .populationServed(getValueOrDefault(properties.population_served))
      // Keep JSON formatting. Post-GIS helpers depend on this.
      .geom(JSON.stringify(value.geometry))
      .build()
  );
}

/**
 * Parses S3 'cleaned_water_systems.geojson' file and writes rows
 * to water systems table in the MainCluster postgres db.
 */
export const handler = geoJsonHandlerFactory(
  s3Params,
  async (rows: any[], rdsDataService: RDSDataService) => {
    await insertBatch(
      rdsDataService,
      rows.map(getTableRowFromRow).filter((row) => row != null) as SqlParametersList[],
    );

    await clusterRows(rdsDataService);
  },
);
