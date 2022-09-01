/**
 * Represent the map data.
 */

import { MapLayer } from '@/model/data_layer';
import { BoundingBox } from '@/model/states/model/geo_data';

/**
 * Model for geo id selection.
 */
interface MapData {
  currentDataLayerId?: MapLayer;
  dataLayers?: MapLayer[];
  zoom?: number;
  scorecardZoom?: ScorecardZoomInfo;
}

interface ScorecardZoomInfo {
  level: ScorecardZoomLevel;
  bounds: BoundingBox;
}

enum ScorecardZoomLevel {
  waterSystem = 'Water system',
  zipCode = 'Zip code',
}

export { MapData, ScorecardZoomInfo, ScorecardZoomLevel };
