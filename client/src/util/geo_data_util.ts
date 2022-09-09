import { GeoData } from '@/model/states/model/geo_data';
import { ZoomLevel } from '@/model/states/model/map_data';

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
}
