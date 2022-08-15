import { APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import { ExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import { CORS_HEADERS } from '../../util';

const moment = require('moment');

const COLUMNS_SELECTED = 6;
const YEAR_BUILD_DATE_FORMAT = 'YYYY';
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
    sql: `SELECT census_geo_id,
                 home_age_index,
                 median_year_built,
                 weighted_national_adi,
                 income_index,
                 median_income
          FROM aggregate_us_demographics
          WHERE census_geo_id = :zip_code LIMIT 1`,
    parameters: params,
  };

  let body: ScorecardApiResponse = {};
  const results = await rdsService.executeStatement(executeParams).promise();
  for (let record of results.records ?? []) {
    if (record.length != COLUMNS_SELECTED) {
      throw 'Error: Failed to read from aggregate demographics table';
    }
    let averageYearsOld;
    const homeYear = record[2].stringValue;
    if (homeYear != null) {
      const homeAge = moment(homeYear, YEAR_BUILD_DATE_FORMAT);
      averageYearsOld = moment().diff(homeAge, 'years');
    }

    body = {
      geoid: record[0].stringValue,
      home_age_index: record[1].doubleValue,
      average_home_age: averageYearsOld,
      average_social_vulnerability: record[3].doubleValue,
      income_index: record[4].doubleValue,
      average_income: record[5].doubleValue,
    };
  }
  return body;
}

export const handler = async (event: {
  pathParameters: ZipcodePathParameters;
}): Promise<APIGatewayProxyResult> => {
  const zipCode = event.pathParameters?.zipcode;
  if (!zipCode || zipCode == '')
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: 'No ZIP code provided.',
    };

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

  console.log('Success:', { zipCode, body });

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
  home_age_index?: number;
  average_social_vulnerability?: number;
  average_income?: number;
  income_index?: number;
  violation_count?: number;
}

/**
 * Acceptable path parameters for the zip code endpoint.
 */
interface ZipcodePathParameters {
  zipcode: string;
}
