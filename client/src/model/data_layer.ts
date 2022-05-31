import { AnyLayer } from 'mapbox-gl';

/**
 * A data layer on the map.
 *
 * A data layer is a visual layer of data which can be viewed on the map, for example, the predicted
 * number of lead service lines per water system. The DataLayer interface contains fields that
 * configure how the data is sourced and rendered on the map.
 */
export interface DataLayer {
  // Unique ID used to identify data layer in mapbox source and style configs.
  id: string;
  // Name of this data layer that is displayed in search bar.
  name: string;
  // Pointer to data. For GeoJSON source this will be a string to the GeoJSON file in the S3 bucket.
  data: string;
  // Layer which specifies the styling of this data layer.
  styleLayer: AnyLayer;
  // Information to display in the map legend when this layer is visible.
  legendInfo: LegendInfo;
}

/**
 * Information to be displayed in the map legend when this layer is visible.
 */
export interface LegendInfo {
  // Legend title.
  title: string;
  // Key / value map of visual representation -> values to be displayed in the legend.
  bucketMap: Map<string, string>;
}

