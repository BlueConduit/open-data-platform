import { APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { RDSDataService } from 'aws-sdk';
import {
  ExecuteStatementRequest,
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
): Promise<BoundedGeoDatum | undefined> {
  // TODO(breuch): Consider updating this to all geoids when we support
  // county, states, etc.
  const executeParams: ExecuteStatementRequest = {
    database: process.env.DATABASE_NAME ?? 'postgres',
    resourceArn: process.env.RESOURCE_ARN ?? '',
    schema: SCHEMA,
    secretArn: process.env.CREDENTIALS_SECRET ?? '',
    /*
    Subquery: selects the one row with the lowest id with that also intersects
      with the provided :long and :lat. Will return a bounding box in the form:
      'NY0700789	'BOX(-74.258843 40.476578,-73.700169 40.917705)'. See ST_EXTENT
      below.
    Outer Query:
      ST_EXTENT: Aggregates the geometries of all rows returned in the subquery
      to return their combined bounding box. See:
      https://postgis.net/docs/manual-1.5/ST_Extent.html
      STRING_AGG: Since ST_EXTENT is an aggregate function (like avg(), max()),
      all other selected rows also need to be aggregated. STRING_AGG just
      concats all the returned rows together. However, this has no effect
      since the subquery already ensures that only one row is returned.
    */
    sql: `
      WITH target_row AS (
        SELECT ${geoid} AS id, geom AS geom
        FROM ${table}
        WHERE geom && ST_SetSRID(ST_Point(:long, :lat), 4326)
          ORDER BY id ASC
          LIMIT 1
      )
      SELECT
        STRING_AGG(id, '|') AS id,
        ST_EXTENT(geom) AS bounding_box
      FROM target_row`,
    parameters: params,
  };
  const results = await rdsService.executeStatement(executeParams).promise();
  const geoID = results.records ? (results.records[0] || undefined) : undefined;
  if(!geoID) return undefined;

  const [rawId, rawBoundingBox] = geoID;

  const boundingBoxVals = rawBoundingBox.stringValue
  ?.replace('BOX(', '').replace(')', '') // strip out the BOX() wrapper
  .split(',') // split into pairs
  .map((pair) => pair.split(' ').map(parseFloat)) // [[-74.1,40.2],[-73.3,40.4]]
  ?? undefined;

  if(!boundingBoxVals || !rawId.stringValue) return undefined;
  const [[minLat, minLon], [maxLat, maxLon]] = boundingBoxVals;

  return {
    id: rawId.stringValue,
    bounding_box: { minLat, minLon, maxLat, maxLon }
  };
}

export const handler = async (event: {
  pathParameters: GeolocatePathParameters;
}): Promise<APIGatewayProxyResult> => {
  const coordinates = event.pathParameters?.latlong ?? '';
  const coordinatesAsLatLong = coordinates.split(',');
  const lat = parseFloat(coordinatesAsLatLong[0]);
  const long = parseFloat(coordinatesAsLatLong[1]);

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
    await Promise.all([
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
    console.log(`Error fetching geo data for ${lat}, ${long}`, error);
    throw error;
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET',
    },
    body: JSON.stringify(body),
  };
};

/**
 * Geoidentifiers returned for a given lat, long point
 */
interface GeolocateApiResponse {
  // Water system id
  water_system_pws_id?: BoundedGeoDatum;
  // Zipcode
  zip_code?: BoundedGeoDatum;
  // County geoid
  county?: BoundedGeoDatum;
  // State abbreviation. i.e. "NY"
  state?: BoundedGeoDatum;
}

/**
 * Acceptable path parameters for this endpoint
 */
interface GeolocatePathParameters {
  // Coordinates to look up geo identifiers, formatted as lat,long.
  latlong: string;
}

interface BoundingBox {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
}

interface BoundedGeoDatum {
  id: string;
  bounding_box: BoundingBox;
}
