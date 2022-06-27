import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import { geoJsonHandlerFactory } from './handler-factory';

// As of 2022-06-27, this should have 26010 rows.
const s3Params = {
  Bucket: 'opendataplatformapistaticdata',
  Key: 'pwsid_lead_connections_even_smaller.geojson',
};

// This can safely complete before the lambda times out.
const DEFAULT_NUMBER_ROWS_TO_INSERT = 10000;

const S3 = new AWS.S3();

/**
 * Single row for water systems table.
 */
class WaterSystemsTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Water system identifier.
  pws_id: string;
  // Water system name.
  pws_name: string;
  // Reported or estimated number of lead pipes in the boundary.
  lead_connections_count: number;
  // Reported or estimated number of connections in the boundary.
  service_connections_count: number;
  // Number of people served by the water system.
  population_served: number;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    pws_id: string,
    pws_name: string,
    lead_connections_count: number,
    service_connections_count: number,
    population_served: number,
    geom: string,
  ) {
    this.pws_id = pws_id;
    this.pws_name = pws_name;
    this.lead_connections_count = lead_connections_count;
    this.service_connections_count = service_connections_count;
    this.population_served = population_served;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the water systems table.
 */
class WaterSystemsTableRowBuilder {
  private readonly _row: WaterSystemsTableRow;

  constructor() {
    this._row = new WaterSystemsTableRow('', '', 0, 0, 0, '');
  }

  pwsId(pwsId: string): WaterSystemsTableRowBuilder {
    this._row.pws_id = pwsId;
    return this;
  }

  pwsName(pwsName: string): WaterSystemsTableRowBuilder {
    this._row.pws_name = pwsName;
    return this;
  }

  geom(geom: string): WaterSystemsTableRowBuilder {
    this._row.geom = geom;
    return this;
  }

  leadConnectionsCount(leadConnectionsCount: number): WaterSystemsTableRowBuilder {
    this._row.lead_connections_count = leadConnectionsCount;
    return this;
  }

  serviceConnectionsCount(serviceConnectionsCount: number): WaterSystemsTableRowBuilder {
    this._row.service_connections_count = serviceConnectionsCount;
    return this;
  }

  populationServed(populationServed: number): WaterSystemsTableRowBuilder {
    this._row.population_served = populationServed;
    return this;
  }

  build(): SqlParametersList {
    return [
      {
        name: 'pws_id',
        value: { stringValue: this._row.pws_id }, // FIGURE OUT WHY THIS IS EMPTY
      },
      {
        name: 'pws_name',
        value: { stringValue: this._row.pws_name },
      },
      {
        name: 'lead_connections_count',
        value: { doubleValue: this._row.lead_connections_count },
      },
      {
        name: 'service_connections_count',
        value: { doubleValue: this._row.service_connections_count },
      },
      {
        name: 'population_served',
        value: { doubleValue: this._row.population_served },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom.toString() },
      },
    ];
  }
}

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
    schema: 'public',
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
