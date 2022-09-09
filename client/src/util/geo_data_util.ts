import { City, GeoData } from '@/model/states/model/geo_data';
import { ZoomLevel } from '@/model/states/model/map_data';
import { LngLatBounds, LngLatLike } from 'mapbox-gl';

// Define Toledo geometry bounding box to restrict parcel data layer to Toledo.
// This is needed because we only have parcel-level predictions for Toledo, so this data layer will
// be empty outside of these boundaries.
const NEW_ORLEANS_BOUNDS =
  new LngLatBounds([[-90.60946799999999, 29.699838], [-89.796438, 30.106005999999997]]);
const RICHMOND_BOUNDS =
  new LngLatBounds([[-77.732045, 37.149377], [-77.223017, 37.77774]]);
const TOLEDO_BOUNDS =
  new LngLatBounds([[-84.3995471043526, 41.165751], [-82.711584, 41.742764]]);

const CITY_BOUNDS = new Map([
  [NEW_ORLEANS_BOUNDS, City.newOrleans],
  [RICHMOND_BOUNDS, City.richmond],
  [TOLEDO_BOUNDS, City.toledo],
]);

/**
 * Utility functions for the GeoData type.
 */
export class GeoDataUtil {
  static isNullOrEmpty(geoData: GeoData | undefined) {
    return (
      geoData == null ||
      (geoData.geoType == null &&
        geoData.pwsId == null &&
        geoData.address == null &&
        geoData.zipCode == null &&
        geoData.lat == null &&
        geoData.long == null)
    );
  }

  /**
   * Sets zoom level options based on the present geo IDs.
   */
  static getZoomOptionsForGeoIds(geoIds: GeoData | undefined): ZoomLevel[] {
    const options: ZoomLevel[] = [];

    // If there is parcel data, just show parcel view.
    if (geoIds?.address?.id) {
      options.push(ZoomLevel.parcel);
      return options;
    }
    if (geoIds?.pwsId?.id) {
      options.push(ZoomLevel.waterSystem);
    }
    if (geoIds?.zipCode?.id) {
      options.push(ZoomLevel.zipCode);
    }
    return options;
  }

  /**
   * Gives the city which contains the given lat, long if it is a supported city
   * (Richmond, New Orleans, Toledo).
   */
  static getCityForLatLong(latString: string | undefined, longString: string | undefined): City | null {
    const lat = Number(latString);
    const long = Number(longString);
    if (!lat || !long) return null;

    let cityForLatLong = null;
    const latLong: LngLatLike = { lng: long, lat: lat };
    CITY_BOUNDS.forEach((city, bound) => {
      if (bound.contains(latLong)) {
        cityForLatLong = city;
        return;
      }
    });
    return cityForLatLong;
  }
}

export { TOLEDO_BOUNDS };
