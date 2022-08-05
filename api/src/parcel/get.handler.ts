import { APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import { ExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
};
const SCHEMA = 'public';
const SQL_QUERY = `SELECT address,
                          public_lead_prediction,
                          private_lead_prediction,
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
  for (let record of results.records ?? []) {
    body = {
      address: record[0].stringValue,
      public_lead_prediction: record[1].doubleValue,
      private_lead_prediction: record[2].doubleValue,
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
  public_lead_prediction?: number;
  private_lead_prediction?: number;
  geom?: string;
}

/**
 * Acceptable path parameters for the parcel endpoint.
 */
interface ParcelPathParameters {
  // Coordinates to look up parcels, formatted as lat,long.
  latlong: string;
}
