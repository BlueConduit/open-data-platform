/**
 * Represent the map data.
 */

import { MapLayer } from '@/model/data_layer';

/**
 * Model for geo id selection.
 */
interface MapData {
  currentDataLayerId?: MapLayer;
  dataLayers?: MapLayer[];
  zoom?: number;
}

export { MapData };
