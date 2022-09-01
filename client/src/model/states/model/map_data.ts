/**
 * Represent the map data.
 */

import { MapLayer } from '@/model/data_layer';
import { BoundingBox } from '@/model/states/model/geo_data';
import { LngLatLike } from 'mapbox-gl';

/**
 * Model for geo id selection.
 */
interface MapData {
  currentDataLayerId?: MapLayer;
  dataLayers?: MapLayer[];
  zoom?: number;
  center?: LngLatLike;
  scorecardZoom?: ScorecardZoomInfo;
}

// TODO: remove this middle object and put all in mapdata.
interface ScorecardZoomInfo {
  level: ScorecardZoomLevel;
  bounds?: BoundingBox;
}

enum ScorecardZoomLevel {
  address = 'Address',
  waterSystem = 'Water system',
  zipCode = 'Zip code',
  unknown = 'Unknown',
}

export { MapData, ScorecardZoomInfo, ScorecardZoomLevel };
