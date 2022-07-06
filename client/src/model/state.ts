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
  currentDataLayer: DataLayer | null;
  dataLayers: DataLayer[];
  map: mapboxgl.Map | null;

  constructor(dataLayers: DataLayer[], initialDataLayer?: DataLayer, map?: mapboxgl.Map) {
    this.dataLayers = dataLayers;
    this.currentDataLayer = initialDataLayer ?? null;
    // Default to first entry in dataLayers if initial layer is not provided and data layers are provided.
    if (this.currentDataLayer == null && dataLayers.length > 0) {
      this.currentDataLayer = dataLayers[0];
    }
    this.map = map ?? null;
  }

  /**
   * Returns default instance of State.
   *
   * This consists of an empty list of dataLayers and null currentDataLayer and map.
   */
  static default(): State {
    return State.constructor([] as DataLayer[]);
  }

  setCurrentDataLayer(newLayer: DataLayer): void {
    if (newLayer == null || this.dataLayers.includes(newLayer)) {
      this.currentDataLayer = newLayer;
    }
  }
}
