/**
 * Global state of the app.
 *
 * Injected into components that need to read or write app data. This consists
 * of the data layers that can be viewed on the map and the current data layer
 * that the map is rendering.
 *
 * TODO(kailamjeter): elaborate here when more fields are added.
 */
import { DataLayer } from '@/model/data_layer';
import mapboxgl from 'mapbox-gl';

export class State {
  currentDataLayer: DataLayer;
  dataLayers: DataLayer[];
  map: mapboxgl.Map;

  constructor(dataLayers: DataLayer[], initialDataLayer: DataLayer, map: mapboxgl.Map) {
    // Default to first entry in dataLayers if initial layer is not provided and data layers are provided.
    this.currentDataLayer = (initialDataLayer == null && dataLayers.length > 0) ? dataLayers[0] : initialDataLayer;
    this.dataLayers = dataLayers;
    this.map = map;
  }

  /**
   * Returns default instance of State.
   *
   * This consists of an empty list of dataLayers and null currentDataLayer.
   */
  static default(): State {
    const initialDataLayer = null as unknown as DataLayer;
    const initialMap = null as unknown as mapboxgl.Map;
    return State.constructor([], initialDataLayer);
  }

  setCurrentDataLayer(newLayer: DataLayer): void {
    if (newLayer == null || this.dataLayers.includes(newLayer)) {
      this.currentDataLayer = newLayer;
    }
  }
}