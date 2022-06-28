import { SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

/**
 * Single row for parcels table.
 */
class ParcelsTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Parcel name.
  address: string;
  // Reported or estimated likelihood of lead pipes for public lines in the boundary.
  public_lead_prediction: number;
  // Reported or estimated likelihood of lead pipes for private lines in the boundary.
  private_lead_prediction: number;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    address: string,
    publicLeadPrediction: number,
    privateLeadPrediction: number,
    geom: string,
  ) {
    this.address = address;
    this.public_lead_prediction = publicLeadPrediction;
    this.private_lead_prediction = privateLeadPrediction;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the parcels table.
 */
export class ParcelsTableRowBuilder {
  private readonly _row: ParcelsTableRow;

  constructor() {
    this._row = new ParcelsTableRow('', '', 0, 0, 0, '', '');
  }

  address(address: string): ParcelsTableRowBuilder {
    this._row.address = address;
    return this;
  }

  publicLeadPrediction(publicLeadPrediction: number): ParcelsTableRowBuilder {
    this._row.public_lead_prediction = publicLeadPrediction;
    return this;
  }

  privateLeadPrediction(populationServed: number): ParcelsTableRowBuilder {
    this._row.private_lead_prediction = populationServed;
    return this;
  }

  geom(geom: string): ParcelsTableRowBuilder {
    this._row.geom = geom;
    return this;
  }

  build(): SqlParametersList {
    return [
      {
        name: 'address',
        value: { stringValue: this._row.address },
      },
      {
        name: 'public_lead_prediction',
        value: { doubleValue: this._row.public_lead_prediction },
      },
      {
        name: 'private_lead_prediction',
        value: { doubleValue: this._row.private_lead_prediction },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom.toString() },
      },
    ];
  }
}
