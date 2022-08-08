import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import { ParcelsTableRowBuilder } from '../model/parcels-table';
import { geoJsonHandlerFactory } from './handler-factory';

const SCHEMA = 'schema';

// This file contains < 145k rows
const s3Params = {
  Bucket: 'opendataplatformapistaticdata',
  // The geometries have been simplified. This file also only includes
  // the rows we currently write to the db to avoid large javascript
  // objects from being created on streamArray().
  Key: 'parcels/toledo_parcel_preds.geojson',
};

/**
 *  Writes rows into the parcel table.
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
    sql: `INSERT INTO parcels (address,
                               city,
                               public_lead_connections_low_estimate,
                               public_lead_connections_high_estimate,
                               private_lead_connections_low_estimate,
                               private_lead_connections_high_estimate,
                               geom)
          VALUES (:address,
                  :city,
                  :public_lead_low_prediction,
                  :public_lead_high_prediction,
                  :private_lead_low_prediction,
                  :private_lead_high_prediction,
                  ST_AsText(ST_GeomFromGeoJSON(:geom))) ON CONFLICT (address) DO NOTHING`,
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
    new ParcelsTableRowBuilder()
      .address(properties.address)
      .city(properties.city ?? '')
      // TODO: Change to real properties once we have them.
      .publicLeadLowPrediction(getValueOrDefault(properties.y_score_pub))
      .publicLeadHighPrediction(getValueOrDefault(properties.y_score_pub))
      .privateLeadLowPrediction(getValueOrDefault(properties.y_score_priv))
      .privateLeadHighPrediction(getValueOrDefault(properties.y_score_priv))
      // Keep JSON formatting. Post-GIS helpers depend on this.
      .geom(JSON.stringify(value.geometry))
      .build()
  );
}

/**
 * Parses S3 'parcels/toledo_parcel_preds.geojson' file and writes rows
 * to parcels in the MainCluster postgres db.
 */
export const handler = geoJsonHandlerFactory(
  s3Params,
  async (rows: any[], rdsDataService: RDSDataService) => {
    await insertBatch(rdsDataService, rows.map(getTableRowFromRow));
  },
);
