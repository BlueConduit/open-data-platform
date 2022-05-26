/**
 * Class representing the current state of the app.
 */
import { DataLayer } from '@/model/data_layer';

export class State {
  currentDataLayer: DataLayer;
  dataLayers: DataLayer[];

  constructor(initialDataLayer: DataLayer, dataLayers: DataLayer[]) {
    this.currentDataLayer = initialDataLayer;
    this.dataLayers = dataLayers;
  }

  setCurrentDataLayer(newLayer: DataLayer): void {
    if (this.dataLayers.includes(newLayer)) {
      this.currentDataLayer = newLayer;
    }
  }
}