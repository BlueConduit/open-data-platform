import { APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import {
  ExecuteStatementRequest,
  FieldList,
  SqlParametersList,
} from 'aws-sdk/clients/rdsdataservice';

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
};
const SCHEMA = 'public';

async function getZipCodeData(
  rdsService: RDSDataService,
  params: SqlParametersList,
): Promise<ScorecardApiResponse> {
  const executeParams: ExecuteStatementRequest = {
    database: process.env.DATABASE_NAME ?? 'postgres',
    resourceArn: process.env.RESOURCE_ARN ?? '',
    schema: SCHEMA,
    secretArn: process.env.CREDENTIALS_SECRET ?? '',
    // TODO(breuch): Replace with real columns needed for scorecard
    sql: `SELECT zip_code,
                 black_population,
                 white_population,
                 under_five_population
          FROM zipcode_demographics
          WHERE census_geo_id = :zip_code LIMIT 1`,
    parameters: params,
  };

  let body: ScorecardApiResponse = {};
  const results = await rdsService.executeStatement(executeParams).promise();
  for (let record of results.records ?? []) {
    body = {
      geoid: record[0].stringValue,
      average_home_age: record[1].doubleValue,
      average_social_vulnerability: record[2].doubleValue,
      average_income: record[3].doubleValue,
    };
  }
  return body;
}

export const handler = async (event: {
  pathParameters: ZipcodePathParameters;
}): Promise<APIGatewayProxyResult> => {
  const zipCode = event.pathParameters?.zip_code ?? '';

  const db = new AWS.RDSDataService();
  const params: SqlParametersList = [
    {
      name: 'zip_code',
      value: { stringValue: zipCode },
    },
  ];
  let body: ScorecardApiResponse;

  try {
    body = await getZipCodeData(db, params);
  } catch (error) {
    console.log(`Error fetching zipcode scorecard for zip code ${zipCode}`, error);
    throw error;
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
};

/**
 * Information for a requested zip code.
 */
interface ScorecardApiResponse {
  geoid?: string;
  average_home_age?: number;
  average_social_vulnerability?: number;
  average_income?: number;
  violation_count?: number;
}

/**
 * Acceptable path parameters for the zip code endpoint.
 */
interface ZipcodePathParameters {
  zip_code: string;
}
