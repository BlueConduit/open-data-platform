/**
 * Represent the map data.
 */

import { MapLayer } from '@/model/data_layer';
import { LngLatLike } from 'mapbox-gl';

/**
 * Model for geo id selection.
 */
interface MapData {
  currentDataLayerId?: MapLayer;
  dataLayers?: MapLayer[];
  zoom?: number;
  center?: LngLatLike;
  zoomLevel?: ZoomLevel;
}

enum ZoomLevel {
  parcel = 'Parcel',
  waterSystem = 'Water system',
  zipCode = 'Zip code',
  country = 'Country',
  unknown = 'Unknown',
}

export { MapData, ZoomLevel };
