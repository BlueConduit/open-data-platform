import { GeoData } from '@/model/states/model/geo_data';

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
}
