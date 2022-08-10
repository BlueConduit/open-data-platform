/**
 * Represent the granularity of a geo query.
 *
 * Must match mapbox.
 * TODO: Unify with geographic level somehow.
 */
enum GeoType {
  address = 'address',
  postcode = 'postcode',
}

/**
 * Model for geo id selection.
 */
interface GeoData {
  pwsId?: string;
  address?: string;
  geoType?: GeoType;
  zipCode?: string;
  lat?: string;
  long?: string;
}

export { GeoData, GeoType };
