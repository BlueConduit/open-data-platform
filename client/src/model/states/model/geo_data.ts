/**
 * Represent the granularity of a geo query.
 *
 * Must match mapbox.
 * TODO: Unify with geographic level somehow.
 */
enum GeoType {
  address = 'address',
  postcode = 'postcode',
  unknown = 'unknown',
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


export { GeoData, GeoType, BoundedGeoDatum };
