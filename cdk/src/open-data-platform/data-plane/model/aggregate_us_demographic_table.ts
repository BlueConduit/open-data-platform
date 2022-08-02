import { SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

/**
 * Single row for aggregate US demographics table.
 */
export class AggregateUsDemographicTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Federal geo-identifier.
  census_geo_id: string;
  // Geographic type. Possible values are 'zip_code', 'county', and 'state'.
  geo_type: string;
  // Name of geo. State or county name, or zipcode.
  name: string;
  // Average home age of the geographic area.
  median_year_built: string;
  // Average income level of the geographic area.
  median_income: number;
  // Average social vulnerability score of the geographic area.
  average_social_vulnerability: number;
  // Size of the population in this geographic area.
  population_count: number;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    census_geo_id: string,
    geo_type: string,
    name: string,
    median_year_built: string,
    median_income: number,
    average_social_vulnerability: number,
    population_count: number,
    geom: string,
  ) {
    this.census_geo_id = census_geo_id;
    this.geo_type = geo_type;
    this.name = name;
    this.median_year_built = median_year_built;
    this.median_income = median_income;
    this.average_social_vulnerability = average_social_vulnerability;
    this.population_count = population_count;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the zipcodes table.
 */
export class AggregateUsDemographicTableRowBuilder {
  private readonly _row: AggregateUsDemographicTableRow;

  constructor() {
    this._row = new AggregateUsDemographicTableRow('', '', '', '', 0, 0, 0, '');
  }

  censusGeoId(censusGeoId: string): AggregateUsDemographicTableRowBuilder {
    this._row.census_geo_id = censusGeoId;
    return this;
  }

  geoType(geoType: string): AggregateUsDemographicTableRowBuilder {
    this._row.geo_type = geoType;
    return this;
  }

  name(name: string): AggregateUsDemographicTableRowBuilder {
    this._row.name = name;
    return this;
  }

  medianYearBuilt(medianYearBuilt: string): AggregateUsDemographicTableRowBuilder {
    this._row.median_year_built = medianYearBuilt;
    return this;
  }

  medianIncome(medianIncome: number): AggregateUsDemographicTableRowBuilder {
    this._row.median_income = medianIncome;
    return this;
  }

  averageSocialVulnerability(averageSocialVulnerability: number): AggregateUsDemographicTableRowBuilder {
    this._row.average_social_vulnerability = averageSocialVulnerability;
    return this;
  }

  populationCount(populationCount: number): AggregateUsDemographicTableRowBuilder {
    this._row.population_count = populationCount;
    return this;
  }

  geom(geom: string): AggregateUsDemographicTableRowBuilder {
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
        name: 'geo_type',
        value: { stringValue: this._row.geo_type },
      },
      {
        name: 'name',
        value: { stringValue: this._row.name },
      },
      {
        name: 'median_year_built',
        value: { stringValue: this._row.median_year_built },
      },
      {
        name: 'median_income',
        value: { doubleValue: this._row.median_income },
      },
      {
        name: 'average_social_vulnerability',
        value: { doubleValue: this._row.average_social_vulnerability },
      },
      {
        name: 'population_count',
        value: { doubleValue: this._row.population_count },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom },
      },
    ];
  }
}
