import { SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

/**
 * Single row for states table.
 */
export class StateTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Federal geo-identifier.
  census_geo_id: string;
  // State FIPS code.
  fips: string;
  // State ANSI code.
  ansi: string;
  // American FactFinder summary level code + geovariant code + '00US' + GEOID.
  aff_geo_id: string;
  // USPS State abbreviation.
  usps: string;
  // Name of the state.
  name: string;
  // Current legal/statistical area description code for state.
  lsad: string;
  // GeoJSON representation of the state boundaries.
  geom: string;

  constructor(
    census_geo_id: string,
    fips: string,
    ansi: string,
    aff_geo_id: string,
    usps: string,
    name: string,
    lsad: string,
    geom: string,
  ) {
    this.census_geo_id = census_geo_id;
    this.fips = fips;
    this.ansi = ansi;
    this.aff_geo_id = aff_geo_id;
    this.usps = usps;
    this.name = name;
    this.lsad = lsad;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the states table.
 */
export class StateTableRowBuilder {
  private readonly _row: StateTableRow;

  constructor() {
    this._row = new StateTableRow('', '', '', '', '', '', '', '');
  }

  censusGeoId(censusGeoId: string): StateTableRowBuilder {
    this._row.census_geo_id = censusGeoId;
    return this;
  }

  fips(fips: string): StateTableRowBuilder {
    this._row.fips = fips;
    return this;
  }

  ansi(ansi: string): StateTableRowBuilder {
    this._row.ansi = ansi;
    return this;
  }

  affGeoId(affGeoId: string): StateTableRowBuilder {
    this._row.aff_geo_id = affGeoId;
    return this;
  }

  usps(usps: string): StateTableRowBuilder {
    this._row.usps = usps;
    return this;
  }

  name(name: string): StateTableRowBuilder {
    this._row.name = name;
    return this;
  }

  lsad(lsad: string): StateTableRowBuilder {
    this._row.lsad = lsad;
    return this;
  }

  geom(geom: string): StateTableRowBuilder {
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
        name: 'fips',
        value: { stringValue: this._row.fips },
      },
      {
        name: 'ansi',
        value: { stringValue: this._row.ansi },
      },
      {
        name: 'aff_geo_id',
        value: { stringValue: this._row.aff_geo_id },
      },
      {
        name: 'usps',
        value: { stringValue: this._row.usps },
      },
      {
        name: 'name',
        value: { stringValue: this._row.name },
      },
      {
        name: 'lsad',
        value: { stringValue: this._row.lsad },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom.toString() },
      },
    ];
  }
}
