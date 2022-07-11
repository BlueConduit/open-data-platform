import { AnyLayer, AnySourceData, FillLayer, VectorSource } from 'mapbox-gl';

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
  // Layer which specifies the styling of this data layer.
  styleLayer: FillLayer;
  // Information to display in the map legend when this layer is visible.
  legendInfo: LegendInfo;
  // Information to display in the map popup when this layer is visible and the user interacts with
  // the map.
  popupInfo: PopupInfo;
  // Data source for the layer.
  source: AnySourceData;
  // Whether it should be selectable in the searchbar.
  visibleInSearchBar: boolean;
}

/**
 * Data layers where the source is a tile server,
 */
export interface TileDataLayer extends DataLayer {
  // The endpoint to the tileserver.
  source: VectorSource;
}

/**
 * Determines how to display a legend bucket
 */
export interface LegendBucketData {
  // Bucket color hex value.
  bucketColor: string;
  // Formatted label for bucket value.
  bucketLabel?: string;
  // Bucket value.
  bucketValue: any;
}

/**
 * Information to be displayed in the map legend when this layer is visible.
 */
export interface LegendInfo {
  // Legend title.
  title: string;
  // Key / value map of visual representation -> values to be displayed in the legend.
  buckets: LegendBucketData[];
  // Data type for value.
  bucketLabelType?: FeaturePropertyDataType;
}

/**
 * Information to be displayed in the map popup when this layer is visible and the user clicks the
 * map.
 */
export interface PopupInfo {
  // Popup title.
  title: string;
  // Popup subtitle.
  subtitle: string;
  // Popup details title.
  detailsTitle: string;
  // Array of feature property objects. This info will be displayed in the map popup.
  featureProperties: FeatureProperty[];
}

export interface FeatureProperty {
  // Label that is displayed when this property is displayed in the UI.
  label: string;
  // Name of this feature property.
  name: string;
  /// Type of data to configure parsing
  dataType: FeaturePropertyDataType;
}

/**
 * Data source type. Required by Mapbox.
 * See: https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/
 */
export enum DataSourceType {
  Unknown = 'unknown',
  Vector = 'vector',
}

/**
 * Type for a feature property to determine how to parse it.
 */
export enum FeaturePropertyDataType {
  Unknown = 'unknown',
  String = 'string',
  Number = 'number',
  Percentage = 'percentage',
  Date = 'date',
  Address = 'address',
}

/**
 * Identifiers for map layers.
 */
export enum MapLayer {
  Unknown = 'unknown',
  LeadServiceLineByParcel = 'lead-service-lines-by-parcel',
  LeadServiceLineByWaterSystem = 'lead-service-lines-by-water-system',
  LeadAndCopperRuleViolationsByWaterSystem = 'epa-lead-and-copper-violations-by-water-system',
  PopulationByCensusBlock = 'population-by-census-block',
}
