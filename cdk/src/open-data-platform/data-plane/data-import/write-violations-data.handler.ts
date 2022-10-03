import { geoJsonHandlerFactory } from './handler-factory';
import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import { ViolationsTableRowBuilder } from '../model/violations-table';

const moment = require('moment');

// As of 8/10/22, there are 3273 rows.
const s3Params = {
  Bucket: 'opendataplatformapistaticdata',
  Key: 'violations_by_water_system.geojson',
};

const POSTGRESQL_DATE_FORMAT = 'YYYY-MM-DD';
const EPA_API_DATE_FORMAT = 'DD-MMM-YY';

const VIOLATION = 'SDWISDM.VIOLATION';
const VIOLATION_ID = `${VIOLATION}.VIOLATION_ID`;
const PWSID = `${VIOLATION}.PWSID`;
const VIOLATION_CODE = `${VIOLATION}.VIOLATION_CODE`;
const COMPLIANCE_STATUS_CODE = `${VIOLATION}.COMPLIANCE_STATUS_CODE`;
const COMPL_PER_BEGIN_DATE = `${VIOLATION}.COMPL_PER_BEGIN_DATE`;
const COMPL_PER_END_DATE = `${VIOLATION}.COMPL_PER_END_DATE`;

/**
 * Status codes that indicate a Lead and Copper Rule violation.
 * See https://www.epa.gov/sites/default/files/2019-07/documents/environments-and-contaminants-methods-drinking-water.pdf
 * Page 4.
 */
const LEAD_AND_COPPER_VIOLATIONS = new Set(['57', '58', '59', '63', '65']);

const COMPLIANCE_STATUS_MAP = new Map([
  // Indicates the violation is not open but the system has not yet been
  // designated as returned to compliance.
  ['K', 'Known'],
  ['O', 'Open'],
  ['R', 'Return to compliance'],
]);

const SCHEMA = 'public';

// Format function below needs these to be %s (string literals) or else
// it produces invalid geometries.
const insertIntoStatement = `INSERT INTO epa_violations (violation_id,
                                                         pws_id,
                                                         violation_code,
                                                         compliance_status,
                                                         start_date,
                                                         end_date,
                                                         state_census_geo_id)
                             SELECT :violation_id,
                                    :pws_id,
                                    :violation_code,
                                    :compliance_status,
                                    TO_DATE(:start_date, 'YYYY-MM-DD'),
                                    NULLIF(TO_DATE(:end_date, 'YYYY-MM-DD'),
                                           TO_DATE('-0001-12-30')),
                                    s.census_geo_id
                             FROM states s
                             WHERE s.usps like
                                   SUBSTRING(:pws_id, 1, 2) ON CONFLICT (violation_id) DO NOTHING`;

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
    sql: insertIntoStatement,
  };
  return rdsService.batchExecuteStatement(batchExecuteParams).promise();
}

/**
 * Maps a data row to a table row ready to write to the db.
 * @param row: row with all data needed to build a [ViolationsTableRow].
 */
function getTableRowFromRow(row: any): SqlParametersList | null {
  const value = row.value;
  const properties = value.properties;
  // Skip violations outside of Lead and Copper Rule violations.
  if (LEAD_AND_COPPER_VIOLATIONS.has(properties[VIOLATION_CODE])) {
    const startDate = moment(properties[COMPL_PER_BEGIN_DATE], EPA_API_DATE_FORMAT);
    let endDateFormatted = '';

    if (properties[COMPL_PER_END_DATE] != '') {
      const endDate = moment(properties[COMPL_PER_END_DATE], EPA_API_DATE_FORMAT);
      endDateFormatted = endDate.format(POSTGRESQL_DATE_FORMAT);
    }

    return new ViolationsTableRowBuilder()
      .violationId(properties[VIOLATION_ID])
      .pwsId(properties[PWSID])
      .violationCode(properties[VIOLATION_CODE])
      .complianceStatus(COMPLIANCE_STATUS_MAP.get(properties[COMPLIANCE_STATUS_CODE]) ?? '')
      .startDate(startDate.format(POSTGRESQL_DATE_FORMAT))
      .endDate(endDateFormatted)
      .build();
  }
  return null;
}

/**
 * Parses S3 'violations_by_water_system.geojson' file and writes rows
 * to violations table in the MainCluster postgres db.
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
