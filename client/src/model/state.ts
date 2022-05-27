/**
 * Class representing the global state of the app.
 *
 * Injected into components that need to read or write app data.
 */
import { DataLayer } from '@/model/data_layer';

export class State {
  currentDataLayer: DataLayer | null;
  dataLayers: DataLayer[];

  constructor(dataLayers: DataLayer[], initialDataLayer?: DataLayer) {
    // Default to first entry in dataLayers if initial layer is not provided and data layers are provided.
    this.currentDataLayer = (initialDataLayer == null && dataLayers.length > 0) ? dataLayers[0] : null;
    this.dataLayers = dataLayers;
  }

  setCurrentDataLayer(newLayer: DataLayer | null): void {
    if (newLayer == null || this.dataLayers.includes(newLayer)) {
      this.currentDataLayer = newLayer;
    }
  }
}