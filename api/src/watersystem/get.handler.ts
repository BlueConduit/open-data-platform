import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import { ExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import { CORS_HEADERS, trimPath } from '../util';

const SCHEMA = 'public';
const SQL_QUERY = `SELECT pws_id,
                          lead_connections_count,
                          service_connections_count
                   FROM water_systems
                   WHERE pws_id = :pws_id LIMIT 1`;

async function getWaterSystemData(
  rdsService: RDSDataService,
  params: SqlParametersList,
): Promise<WaterSystemApiResponse> {
  const executeParams: ExecuteStatementRequest = {
    database: process.env.DATABASE_NAME ?? 'postgres',
    resourceArn: process.env.RESOURCE_ARN ?? '',
    schema: SCHEMA,
    secretArn: process.env.CREDENTIALS_SECRET ?? '',
    sql: SQL_QUERY,
    parameters: params,
  };
  let body: WaterSystemApiResponse = {};

  const results = await rdsService.executeStatement(executeParams).promise();
  for (let record of results.records ?? []) {
    body = {
      pws_id: record[0].stringValue,
      lead_service_lines: record[1].doubleValue,
      service_lines: record[2].doubleValue,
    };
  }
  return body;
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  // Parse out the path parameters.
  const pwsId = trimPath(event.rawPath)[2];
  if (!pwsId || pwsId == '')
    return { statusCode: 400, headers: CORS_HEADERS, body: 'No pws_id provided.' };

  const db = new AWS.RDSDataService();
  const params: SqlParametersList = [
    {
      name: 'pws_id',
      value: { stringValue: pwsId },
    },
  ];
  let body: WaterSystemApiResponse;

  try {
    body = await getWaterSystemData(db, params);
  } catch (error) {
    console.log(`Error fetching water system data for pws id ${pwsId}`, error);
    throw error;
  }

  console.log('Success:', { pwsId, body });

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
};

/**
 * Information for a requested water system.
 */
interface WaterSystemApiResponse {
  // Water system id
  pws_id?: string;
  lead_service_lines?: number;
  service_lines?: number;
}
