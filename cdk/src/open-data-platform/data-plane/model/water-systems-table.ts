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
  // Whether or not BC estimated the lead and service connections count.
  // If false, these were reported values.
  is_estimated: boolean;
  // Reported estimate of number of lead pipes in the boundary.
  lead_connections_count?: number;
  // Reported or estimated total number of connections in the boundary.
  service_connections_count?: number;
  // Number of people served by the water system.
  population_served?: number;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    pws_id: string,
    pws_name: string,
    is_estimated: boolean,
    lead_connections_count: number,
    service_connections_count: number,
    population_served: number,
    geom: string,
  ) {
    this.pws_id = pws_id;
    this.pws_name = pws_name;
    this.is_estimated = is_estimated;
    this.lead_connections_count = lead_connections_count;
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
    this._row = new WaterSystemsTableRow('', '', true, 0, 0, 0, '');
  }

  pwsId(pwsId: string): WaterSystemsTableRowBuilder {
    this._row.pws_id = pwsId;
    return this;
  }

  pwsName(pwsName: string): WaterSystemsTableRowBuilder {
    this._row.pws_name = pwsName;
    return this;
  }

  isEstimated(isEstimated: boolean): WaterSystemsTableRowBuilder {
    this._row.is_estimated = isEstimated;
    return this;
  }

  geom(geom: string): WaterSystemsTableRowBuilder {
    this._row.geom = geom;
    return this;
  }

  leadConnectionsCount(leadConnectionsCount?: number): WaterSystemsTableRowBuilder {
    this._row.lead_connections_count = leadConnectionsCount;
    return this;
  }

  serviceConnectionsCount(serviceConnectionsCount?: number): WaterSystemsTableRowBuilder {
    this._row.service_connections_count = serviceConnectionsCount;
    return this;
  }

  populationServed(populationServed?: number): WaterSystemsTableRowBuilder {
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
        name: 'is_estimated',
        value: { booleanValue: this._row.is_estimated },
      },
      {
        name: 'lead_connections_count',
        value: {
          doubleValue: this._row.lead_connections_count,
          isNull: this._row.lead_connections_count == null,
        },
      },
      {
        name: 'service_connections_count',
        value: {
          doubleValue: this._row.service_connections_count,
          isNull: this._row.service_connections_count == null,
        },
      },
      {
        name: 'population_served',
        value: {
          doubleValue: this._row.population_served,
          isNull: this._row.population_served == null,
        },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom.toString() },
      },
    ];
  }
}
