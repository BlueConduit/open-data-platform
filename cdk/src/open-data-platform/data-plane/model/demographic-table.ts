import { SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

/**
 * Single row for demographics table.
 */
class DemographicsTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.
  census_geo_id: string;
  name: string;
  total_population: number;
  under_five_population: number;
  poverty_population: number;
  black_population: number;
  white_population: number;
  state_census_geo_id: string;
  county_census_geo_id: string;
  geom: string;

  constructor(
    censusGeoId: string,
    name: string,
    totalPopulation: number,
    under_five_population: number,
    poverty_population: number,
    blackPopulation: number,
    whitePopulation: number,
    stateCensusGeoId: string,
    countyCensusGeoId: string,
    geom: string,
  ) {
    this.census_geo_id = censusGeoId;
    this.name = name;
    this.total_population = totalPopulation;
    this.under_five_population = under_five_population;
    this.poverty_population = poverty_population;
    this.black_population = blackPopulation;
    this.white_population = whitePopulation;
    this.state_census_geo_id = stateCensusGeoId;
    this.county_census_geo_id = countyCensusGeoId;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the Demographics table.
 */
export class DemographicsTableRowBuilder {
  private readonly _row: DemographicsTableRow;

  constructor() {
    this._row = new DemographicsTableRow('', '', 0, 0, 0, 0, 0, '', '', '');
  }

  censusGeoId(censusGeoId: string): DemographicsTableRowBuilder {
    this._row.census_geo_id = censusGeoId;
    return this;
  }

  stateCensusGeoId(stateGeoId: string): DemographicsTableRowBuilder {
    this._row.state_census_geo_id = stateGeoId;
    return this;
  }

  countyCensusGeoId(countyGeoId: string): DemographicsTableRowBuilder {
    this._row.county_census_geo_id = countyGeoId;
    return this;
  }

  name(name: string): DemographicsTableRowBuilder {
    this._row.name = name;
    return this;
  }

  totalPopulation(totalPopulation: number): DemographicsTableRowBuilder {
    this._row.total_population = totalPopulation;
    return this;
  }

  underFivePopulation(underFivePopulation: number): DemographicsTableRowBuilder {
    this._row.under_five_population = underFivePopulation;
    return this;
  }

  povertyPopulation(povertyTotal: number): DemographicsTableRowBuilder {
    this._row.poverty_population = povertyTotal;
    return this;
  }

  blackPopulation(blackPopulation: number): DemographicsTableRowBuilder {
    this._row.black_population = blackPopulation;
    return this;
  }

  whitePopulation(whitePopulation: number): DemographicsTableRowBuilder {
    this._row.white_population = whitePopulation;
    return this;
  }

  geom(geom: string): DemographicsTableRowBuilder {
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
        name: 'census_block_name',
        value: { stringValue: this._row.name },
      },
      {
        name: 'total_population',
        value: { doubleValue: this._row.total_population },
      },
      {
        name: 'under_five_population',
        value: { doubleValue: this._row.under_five_population },
      },
      {
        name: 'poverty_population',
        value: { doubleValue: this._row.poverty_population },
      },
      {
        name: 'black_population',
        value: { doubleValue: this._row.black_population },
      },
      {
        name: 'white_population',
        value: { doubleValue: this._row.white_population },
      },
      {
        name: 'county_census_geo_id',
        value: { stringValue: this._row.county_census_geo_id },
      },
      {
        name: 'state_census_geo_id',
        value: { stringValue: this._row.state_census_geo_id },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom.toString() },
      },
    ];
  }
}
