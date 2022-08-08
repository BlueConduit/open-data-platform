import { APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import { ExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import * as assert from 'assert';

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
};
const COLUMNS_SELECTED = 5;
const SCHEMA = 'public';
const SQL_QUERY = `SELECT address,
                          public_lead_connections_low_estimate,
                          public_lead_connections_high_estimate,
                          private_lead_connections_low_estimate,
                          private_lead_connections_high_estimate,
                          geom
                   FROM parcels
                   WHERE geom && ST_SetSRID(ST_Point(:long, :lat), 4326)
                   LIMIT 1`;

async function getParcelData(
  rdsService: RDSDataService,
  params: SqlParametersList,
): Promise<ParcelApiResponse> {
  const executeParams: ExecuteStatementRequest = {
    database: process.env.DATABASE_NAME ?? 'postgres',
    resourceArn: process.env.RESOURCE_ARN ?? '',
    schema: SCHEMA,
    secretArn: process.env.CREDENTIALS_SECRET ?? '',
    sql: SQL_QUERY,
    parameters: params,
  };
  let body: ParcelApiResponse = {};

  const results = await rdsService.executeStatement(executeParams).promise();
  assert(results.records?.length == COLUMNS_SELECTED);
  for (let record of results.records ?? []) {
    body = {
      address: record[0].stringValue,
      public_lead_low_prediction: record[1].doubleValue,
      public_lead_high_prediction: record[2].doubleValue,
      private_lead_low_prediction: record[3].doubleValue,
      private_lead_high_prediction: record[4].doubleValue,
    };
  }
  return body;
}

export const handler = async (event: {
  pathParameters: ParcelPathParameters;
}): Promise<APIGatewayProxyResult> => {
  const coordinates = event.pathParameters?.latlong ?? '';
  const coordinatesAsLatLong = coordinates.split(',');
  const lat = parseFloat(coordinatesAsLatLong[0]);
  const long = parseFloat(coordinatesAsLatLong[1]);

  const db = new AWS.RDSDataService();
  const params: SqlParametersList = [
    {
      name: 'lat',
      value: { doubleValue: lat },
    },
    {
      name: 'long',
      value: { doubleValue: long },
    },
  ];
  let body: ParcelApiResponse;

  try {
    body = await getParcelData(db, params);
  } catch (error) {
    console.log(`Error fetching parcel data for ${lat}, ${long}`, error);
    throw error;
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
};

/**
 * Information for a requested parcel.
 */
interface ParcelApiResponse {
  address?: string;
  public_lead_low_prediction?: number;
  public_lead_high_prediction?: number;
  private_lead_low_prediction?: number;
  private_lead_high_prediction?: number;
  geom?: string;
}

/**
 * Acceptable path parameters for the parcel endpoint.
 */
interface ParcelPathParameters {
  // Coordinates to look up parcels, formatted as lat,long.
  latlong: string;
}
