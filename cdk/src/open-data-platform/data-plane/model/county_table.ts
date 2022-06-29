import { SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

/**
 * Single row for counties table.
 */
export class CountiesTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Federal geo-identifier.
  census_geo_id: string;
  // County FIPS code.
  fips: string;
  // State FIPS code.
  state_fips: string;
  // ANSI code.
  ansi: string;
  // American FactFinder summary level code + geovariant code + '00US' + GEOID.
  aff_geo_id: string;
  // Name of the county.
  name: string;
  // Current legal/statistical area description code for state.
  lsad: string;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    census_geo_id: string,
    fips: string,
    state_fips: string,
    ansi: string,
    aff_geo_id: string,
    name: string,
    lsad: string,
    geom: string,
  ) {
    this.census_geo_id = census_geo_id;
    this.fips = fips;
    this.state_fips = state_fips;
    this.ansi = ansi;
    this.aff_geo_id = aff_geo_id;
    this.lsad = lsad;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the counties table.
 */
export class CountiesTableRowBuilder {
  private readonly _row: CountiesTableRow;

  constructor() {
    this._row = new CountiesTableRow('', '', '', '', '', '', '', '');
  }

  censusGeoId(censusGeoId: string): CountiesTableRowBuilder {
    this._row.census_geo_id = censusGeoId;
    return this;
  }

  fips(fips: string): CountiesTableRowBuilder {
    this._row.fips = fips;
    return this;
  }

  stateFips(stateFips: string): CountiesTableRowBuilder {
    this._row.state_fips = stateFips;
    return this;
  }

  ansi(ansi: string): CountiesTableRowBuilder {
    this._row.ansi = ansi;
    return this;
  }

  affGeoId(affGeoId: string): CountiesTableRowBuilder {
    this._row.aff_geo_id = affGeoId;
    return this;
  }

  name(name: string): CountiesTableRowBuilder {
    this._row.name = name;
    return this;
  }

  lsad(lsad: string): CountiesTableRowBuilder {
    this._row.lsad = lsad;
    return this;
  }

  geom(geom: string): CountiesTableRowBuilder {
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
        name: 'state_fips',
        value: { stringValue: this._row.state_fips },
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
        name: 'name',
        value: { stringValue: this._row.name },
      },
      {
        name: 'lsad',
        value: { stringValue: this._row.lsad },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom },
      },
    ];
  }
}
