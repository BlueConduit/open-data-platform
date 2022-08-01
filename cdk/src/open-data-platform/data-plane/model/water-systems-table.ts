import { SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

/**
 * Single row for water systems table.
 */
class WaterSystemsTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Water system identifier.
  pws_id: string;
  // Water system name.
  pws_name: string;
  // Reported or low estimate of number of lead pipes in the boundary.
  lead_connections_low_estimate: number;
  // Reported or high estimate number of lead pipes in the boundary.
  lead_connections_high_estimate: number;
  // Reported or estimated number of connections in the boundary.
  service_connections_count: number;
  // Number of people served by the water system.
  population_served: number;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    pws_id: string,
    pws_name: string,
    lead_connections_low_estimate: number,
    lead_connections_high_estimate: number,
    service_connections_count: number,
    population_served: number,
    geom: string,
  ) {
    this.pws_id = pws_id;
    this.pws_name = pws_name;
    this.lead_connections_low_estimate = lead_connections_low_estimate;
    this.lead_connections_high_estimate = lead_connections_high_estimate;
    this.service_connections_count = service_connections_count;
    this.population_served = population_served;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the water systems table.
 */
export class WaterSystemsTableRowBuilder {
  private readonly _row: WaterSystemsTableRow;

  constructor() {
    this._row = new WaterSystemsTableRow('', '', 0, 0, 0, 0, '');
  }

  pwsId(pwsId: string): WaterSystemsTableRowBuilder {
    this._row.pws_id = pwsId;
    return this;
  }

  pwsName(pwsName: string): WaterSystemsTableRowBuilder {
    this._row.pws_name = pwsName;
    return this;
  }

  geom(geom: string): WaterSystemsTableRowBuilder {
    this._row.geom = geom;
    return this;
  }

  leadConnectionsLowEstimate(leadConnectionsLowEstimate: number): WaterSystemsTableRowBuilder {
    this._row.lead_connections_low_estimate = leadConnectionsLowEstimate;
    return this;
  }

  leadConnectionsHighEstimate(leadConnectionsHighEstimate: number): WaterSystemsTableRowBuilder {
    this._row.lead_connections_high_estimate = leadConnectionsHighEstimate;
    return this;
  }

  serviceConnectionsCount(serviceConnectionsCount: number): WaterSystemsTableRowBuilder {
    this._row.service_connections_count = serviceConnectionsCount;
    return this;
  }

  populationServed(populationServed: number): WaterSystemsTableRowBuilder {
    this._row.population_served = populationServed;
    return this;
  }

  build(): SqlParametersList {
    return [
      {
        name: 'pws_id',
        value: { stringValue: this._row.pws_id },
      },
      {
        name: 'pws_name',
        value: { stringValue: this._row.pws_name },
      },
      {
        name: 'lead_connections_low_estimate',
        value: { doubleValue: this._row.lead_connections_low_estimate },
      },
      {
        name: 'lead_connections_high_estimate',
        value: { doubleValue: this._row.lead_connections_high_estimate },
      },
      {
        name: 'service_connections_count',
        value: { doubleValue: this._row.service_connections_count },
      },
      {
        name: 'population_served',
        value: { doubleValue: this._row.population_served },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom.toString() },
      },
    ];
  }
}
