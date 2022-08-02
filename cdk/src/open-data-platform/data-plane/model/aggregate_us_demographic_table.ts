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
  // Average home age of the zipcode.
  average_home_age: number;
  // Average income level of the zipcode.
  average_income_level: number;
  // Average social vulnerability score of the zipcode.
  average_social_vulnerability: number;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    census_geo_id: string,
    geo_type: string,
    name: string,
    average_home_age: number,
    average_income_level: number,
    average_social_vulnerability: number,
    geom: string,
  ) {
    this.census_geo_id = census_geo_id;
    this.geo_type = geo_type;
    this.name = name;
    this.average_home_age = average_home_age;
    this.average_income_level = average_income_level;
    this.average_social_vulnerability = average_social_vulnerability;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the zipcodes table.
 */
export class AggregateUsDemographicTableRowBuilder {
  private readonly _row: AggregateUsDemographicTableRow;

  constructor() {
    this._row = new AggregateUsDemographicTableRow('', '', '', 0, 0, 0, '');
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

  averageHomeAge(averageHomeAge: number): AggregateUsDemographicTableRowBuilder {
    this._row.average_home_age = averageHomeAge;
    return this;
  }

  averageIncomeLevel(averageIncomeLevel: number): AggregateUsDemographicTableRowBuilder {
    this._row.average_income_level = averageIncomeLevel;
    return this;
  }

  averageSocialVulnerability(averageSocialVulnerability: number): AggregateUsDemographicTableRowBuilder {
    this._row.average_social_vulnerability = averageSocialVulnerability;
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
        name: 'average_home_age',
        value: { doubleValue: this._row.average_home_age },
      },
      {
        name: 'average_income_level',
        value: { doubleValue: this._row.average_income_level },
      },
      {
        name: 'average_social_vulnerability',
        value: { doubleValue: this._row.average_social_vulnerability },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom },
      },
    ];
  }
}
