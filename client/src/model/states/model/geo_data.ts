/**
 * Represent the granularity of a geo query.
 *
 * Must match mapbox data types. See https://docs.mapbox.com/api/search/geocoding/#data-types.
 * TODO: Unify with geographic level somehow.
 */
enum GeoType {
  address = 'address',
  country = 'country',
  district = 'district',
  locality = 'locality',
  neighborhood = 'neighborhood',
  place = 'place',
  poi = 'poi',
  postcode = 'postcode',
  region = 'region',
  unknown = 'unknown',
}

/**
 * Represents cities which we have parcel data for. 
 * 
 * Used to display city-specific information.
 */
enum City {
  toledo = 'toledo',
}

/**
 * Model for geo id selection.
 */
interface GeoData {
  pwsId?: BoundedGeoDatum;
  address?: string;
  geoType?: GeoType;
  zipCode?: BoundedGeoDatum;
  lat?: string;
  long?: string;
  city?: City;
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


export { City, GeoData, GeoType, BoundedGeoDatum };
