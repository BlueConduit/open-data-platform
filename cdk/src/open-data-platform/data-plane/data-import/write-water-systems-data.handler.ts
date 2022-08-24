import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
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
                                     lead_connections_count,
                                     service_connections_count,
                                     population_served,
                                     state_census_geo_id,
                                     geom)
          SELECT :pws_id,
                 :pws_name,
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
 * Sometimes these fields are negative because they are based on a regression.
 */
function getValueOrDefault(field: string): number {
  return Math.max(parseFloat(field == 'NaN' || field == null ? '0' : field), 0);
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

  const reportedLeadConnections = getValueOrDefault(properties.lead_connections);
  let leadConnectionsCount;

  // If there is a reported lead count, use that
  if (reportedLeadConnections > 0) {
    leadConnectionsCount = reportedLeadConnections;
    // Otherwise, get estimate from prediction interval.
  } else {
    // TODO: Switch to storing low, high in db.
    leadConnectionsCount =
      (getValueOrDefault(properties.low) + getValueOrDefault(properties.high)) / 2;
  }
  return (
    new WaterSystemsTableRowBuilder()
      .pwsId(properties.pwsid)
      .pwsName(properties.pws_name ?? '')
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
  },
);
