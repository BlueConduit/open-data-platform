import { SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

enum GeoType {
  Zipcode = 'zip_code',
  County = 'county',
  State = 'state',
  Unknown = 'unknown',
}

/**
 * Single row for aggregate US demographics table.
 */
class AggregateUsDemographicTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Federal geo-identifier.
  census_geo_id: string;
  // Geographic type. Possible values are 'zip_code', 'county', and 'state'.
  geo_type: GeoType;
  // Name of geo. State or county name, or zipcode.
  name: string;
  // Average home age of the geographic area.
  median_year_built: string;
  // Average income level of the geographic area.
  median_income: number;
  // Index value for geographic area home age.
  home_age_index: number;
  // Index value for geographic area income.
  income_index: number;
  // Average social vulnerability score of the geographic area.
  weighted_national_adi: number;
  // Average social vulnerability score of the geographic area.
  weighted_state_adi: number;
  // Size of the population in this geographic area.
  population_count: number;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    census_geo_id: string,
    geo_type: GeoType,
    name: string,
    median_year_built: string,
    median_income: number,
    home_age_index: number,
    income_index: number,
    weighted_national_adi: number,
    weighted_state_adi: number,
    population_count: number,
    geom: string,
  ) {
    this.census_geo_id = census_geo_id;
    this.geo_type = geo_type;
    this.name = name;
    this.median_year_built = median_year_built;
    this.median_income = median_income;
    this.home_age_index = home_age_index;
    this.income_index = income_index;
    this.weighted_national_adi = weighted_national_adi;
    this.weighted_state_adi = weighted_state_adi;
    this.population_count = population_count;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the zipcodes table.
 */
class AggregateUsDemographicTableRowBuilder {
  private readonly _row: AggregateUsDemographicTableRow;

  constructor() {
    this._row = new AggregateUsDemographicTableRow('', GeoType.Unknown, '', '', 0, 0, 0, 0, 0, 0, '');
  }

  censusGeoId(censusGeoId: string): AggregateUsDemographicTableRowBuilder {
    this._row.census_geo_id = censusGeoId;
    return this;
  }

  geoType(geoType: GeoType): AggregateUsDemographicTableRowBuilder {
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

  homeAgeIndex(homeAgeIndex: number): AggregateUsDemographicTableRowBuilder {
    this._row.home_age_index = homeAgeIndex;
    return this;
  }

  incomeIndex(incomeIndex: number): AggregateUsDemographicTableRowBuilder {
    this._row.income_index = incomeIndex;
    return this;
  }

  weightedNationalAdi(weightedNationalAdi: number): AggregateUsDemographicTableRowBuilder {
    this._row.weighted_national_adi = weightedNationalAdi;
    return this;
  }

  weightedStateAdi(weightedStateAdi: number): AggregateUsDemographicTableRowBuilder {
    this._row.weighted_state_adi = weightedStateAdi;
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
        value: { stringValue: this._row.geo_type.valueOf() },
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
        name: 'home_age_index',
        value: { doubleValue: this._row.home_age_index },
      },
      {
        name: 'income_index',
        value: { doubleValue: this._row.income_index },
      },
      {
        name: 'weighted_national_adi',
        value: { doubleValue: this._row.weighted_national_adi },
      },
      {
        name: 'weighted_state_adi',
        value: { doubleValue: this._row.weighted_state_adi },
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

export { GeoType, AggregateUsDemographicTableRow, AggregateUsDemographicTableRowBuilder };