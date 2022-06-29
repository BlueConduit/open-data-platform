import { SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

/**
 * Single row for counties table.
 */
export class CountiesTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  census_geo_id: string;
  // County FIPS code.
  county_fips: string;
  // State FIPS code.
  state_fips: string;
  // ANSI code.
  county_ansi: string;
  // American FactFinder summary level code + geovariant code + '00US' + GEOID
  aff_geo_id: string;
  // Name of the county
  name: string;
  // The current name of the county or equivalent entity, along with the
  // associated legal/statistical area description (county, parish, borough, etc)
  name_with_description: string;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    census_geo_id: string,
    county_fips: string,
    state_fips: string,
    county_ansi: string,
    aff_geo_id: string,
    name: string,
    name_with_description: string,
    geom: string,
  ) {
    this.census_geo_id = census_geo_id;
    this.county_fips = county_fips;
    this.state_fips = state_fips;
    this.county_ansi = county_ansi;
    this.aff_geo_id = aff_geo_id;
    this.name_with_description = name_with_description;
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

  countyFips(countyFips: string): CountiesTableRowBuilder {
    this._row.county_fips = countyFips;
    return this;
  }

  stateFips(stateFips: string): CountiesTableRowBuilder {
    this._row.state_fips = stateFips;
    return this;
  }

  countyAnsi(countyAnsi: string): CountiesTableRowBuilder {
    this._row.county_ansi = countyAnsi;
    return this;
  }

  affGeoId(addGeoId: string): CountiesTableRowBuilder {
    this._row.aff_geo_id = addGeoId;
    return this;
  }

  name(name: string): CountiesTableRowBuilder {
    this._row.name = name;
    return this;
  }

  nameWithDescription(nameWithDescription: string): CountiesTableRowBuilder {
    this._row.name_with_description = nameWithDescription;
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
        name: 'county_fips',
        value: { stringValue: this._row.county_fips },
      },
      {
        name: 'state_fips',
        value: { stringValue: this._row.state_fips },
      },
      {
        name: 'county_ansi',
        value: { stringValue: this._row.county_ansi },
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
        name: 'name_with_description',
        value: { stringValue: this._row.name_with_description },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom },
      },
    ];
  }
}
