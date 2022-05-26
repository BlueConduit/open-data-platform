/**
 * Class representing a data layer on the map.
 */
export class DataLayer {
  name: string;

  constructor(layerName: string) {
    this.name = layerName;
  }

  getName() : string {
    return this.name;
  }
}