/**
 * Represent the map data.
 */

import { GeographicLevel, MapLayer } from '@/model/data_layer';
import { LngLatLike } from 'mapbox-gl';

/**
 * Model for geo id selection.
 */
interface MapData {
  currentDataLayerId?: MapLayer;
  dataLayers?: MapLayer[];
  zoom?: number;
  center?: LngLatLike;
  geographicView?: GeographicLevel;
}

export { MapData };
