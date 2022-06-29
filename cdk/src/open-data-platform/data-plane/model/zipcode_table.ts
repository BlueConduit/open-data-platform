import { SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

/**
 * Single row for zipcodes table.
 */
export class ZipcodeTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Federal geo-identifier.
  census_geo_id: string;

  zipcode: string;
  // 2020 Census legal/statistical area description code for county.
  description: string;
  // American FactFinder summary level code + geovariant code + '00US' + GEOID.
  aff_geo_id: string;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    census_geo_id: string,
    zipcode: string,
    description: string,
    aff_geo_id: string,
    geom: string,
  ) {
    this.census_geo_id = census_geo_id;
    this.zipcode = zipcode;
    this.description = description;
    this.aff_geo_id = aff_geo_id;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the zipcodes table.
 */
export class ZipcodeTableRowBuilder {
  private readonly _row: ZipcodeTableRow;

  constructor() {
    this._row = new ZipcodeTableRow('', '', '', '', '', '', '', '');
  }

  censusGeoId(censusGeoId: string): ZipcodeTableRowBuilder {
    this._row.census_geo_id = censusGeoId;
    return this;
  }

  zipcode(zipcode: string): ZipcodeTableRowBuilder {
    this._row.zipcode = zipcode;
    return this;
  }

  description(description: string): ZipcodeTableRowBuilder {
    this._row.description = description;
    return this;
  }

  affGeoId(affGeoId: string): ZipcodeTableRowBuilder {
    this._row.aff_geo_id = affGeoId;
    return this;
  }

  geom(geom: string): ZipcodeTableRowBuilder {
    this._row.geom = geom;
    return this;
  }

  build(): SqlParametersList {
    return [
      {
        name: 'census_geo_id',
        value: { stringValue: this._row.census_geo_id },
      },
      {
        name: 'zipcode',
        value: { stringValue: this._row.zipcode },
      },
      {
        name: 'aff_geo_id',
        value: { stringValue: this._row.aff_geo_id },
      },
      {
        name: 'description',
        value: { stringValue: this._row.description },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom },
      },
    ];
  }
}
