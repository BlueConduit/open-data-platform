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

export class State {
  currentDataLayer: DataLayer;
  dataLayers: DataLayer[];

  constructor(dataLayers: DataLayer[], initialDataLayer: DataLayer) {
    // Default to first entry in dataLayers if initial layer is not provided and data layers are provided.
    this.currentDataLayer = (initialDataLayer == null && dataLayers.length > 0) ? dataLayers[0] : initialDataLayer;
    this.dataLayers = dataLayers;
  }

  /**
   * Returns default instance of State.
   *
   * This consists of an empty list of dataLayers and null currentDataLayer.
   */
  static default(): State {
    return State.constructor([], null as unknown as DataLayer);
  }

  setCurrentDataLayer(newLayer: DataLayer): void {
    if (newLayer == null || this.dataLayers.includes(newLayer)) {
      this.currentDataLayer = newLayer;
    }
  }
}