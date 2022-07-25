import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import {
  ExecuteStatementRequest,
  FieldList,
  SqlParametersList,
} from 'aws-sdk/clients/rdsdataservice';

const SCHEMA = 'public';

/**
 * Returns all geo identifiers that intersect with a lat, long.
 * @param rdsService: RDS service to connect to the db.
 * @param params: with lat and long coordinates sued to query tables.
 * @param geoid: identifier to retrieve for a table.
 * @param table: db table to query.
 */
async function getGeoDataForLatLong(
  rdsService: RDSDataService,
  params: SqlParametersList,
  geoid: string,
  table: string,
): Promise<string | undefined> {
  const executeParams: ExecuteStatementRequest = {
    database: process.env.DATABASE_NAME ?? 'postgres',
    resourceArn: process.env.RESOURCE_ARN ?? '',
    schema: SCHEMA,
    secretArn: process.env.CREDENTIALS_SECRET ?? '',
    sql: `SELECT ${geoid}
          FROM ${table}
          WHERE geom && ST_SetSRID(ST_Point(:long, :lat), 4326)
          LIMIT 1`,
    parameters: params,
  };
  const results = await rdsService.executeStatement(executeParams).promise();
  const geoids = results.records?.map((record: FieldList) => record[0].stringValue) ?? [];
  return geoids[0];
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const lat = parseFloat(event.queryStringParameters?.lat ?? '');
  const long = parseFloat(event.queryStringParameters?.long ?? '');

  // TODO(breuch): Throw error when lat, long are not passed in.
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
  let body: GeolocateApiResponse = {};

  try {
    await Promise.allSettled([
      getGeoDataForLatLong(db, params, 'pws_id', 'water_systems').then(
        (pws_id) => (body.water_system_pws_id = pws_id),
      ),
      getGeoDataForLatLong(db, params, 'zipcode', 'zipcodes').then(
        (zip_code) => (body.zip_code = zip_code),
      ),
      getGeoDataForLatLong(db, params, 'census_geo_id', 'counties').then(
        (county) => (body.county = county),
      ),
      getGeoDataForLatLong(db, params, 'usps', 'states').then((state) => (body.state = state)),
    ]);
  } catch (error) {
    console.log(`Error finding geo data for ${lat}, ${long}`, error);
    throw error;
  }

  return {
    statusCode: 200,
    body: JSON.stringify(body),
  };
};

/**
 * Geoidentifiers returned for a given lat, long point
 */
interface GeolocateApiResponse {
  // Water system id
  water_system_pws_id?: string;
  // Zipcode
  zip_code?: string;
  // County geoid
  county?: string;
  // State abbreviation. i.e. "NY"
  state?: string;
}
