import { SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

/**
 * Single row for parcels table.
 */
class ParcelsTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Parcel name.
  address: string;
  // City of parcel.
  city: string;
  // Reported or estimated likelihood of lead pipes (low end of a 95% confidence
  // interval) for public lines in the boundary.
  public_lead_low_prediction: number;
  // Reported or estimated likelihood of lead pipes (high end of a 95% confidence
  // interval) for public lines in the boundary.
  public_lead_high_prediction: number;
  // Reported or estimated likelihood of lead pipes (low end of a 95% confidence
  // interval) for private lines in the boundary.
  private_lead_low_prediction: number;
  // Reported or estimated likelihood of lead pipes (high end of a 95% confidence
  // interval) for private lines in the boundary.
  private_lead_high_prediction: number;
  // GeoJSON representation of the boundaries.
  geom: string;

  constructor(
    address: string,
    publicLeadLowPrediction: number,
    publicLeadHighPrediction: number,
    privateLeadLowPrediction: number,
    privateLeadHighPrediction: number,
    geom: string,
  ) {
    this.address = address;
    this.public_lead_low_prediction = publicLeadLowPrediction;
    this.public_lead_high_prediction = publicLeadHighPrediction;
    this.private_lead_low_prediction = privateLeadLowPrediction;
    this.private_lead_high_prediction = privateLeadHighPrediction;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the parcels table.
 */
export class ParcelsTableRowBuilder {
  private readonly _row: ParcelsTableRow;

  constructor() {
    this._row = new ParcelsTableRow('', 0, 0, 0, 0, '');
  }

  address(address: string): ParcelsTableRowBuilder {
    this._row.address = address;
    return this;
  }

  city(city: string): ParcelsTableRowBuilder {
    this._row.city = city;
    return this;
  }

  publicLeadLowPrediction(publicLeadLowPrediction: number): ParcelsTableRowBuilder {
    this._row.public_lead_low_prediction = publicLeadLowPrediction;
    return this;
  }

  publicLeadHighPrediction(publicLeadHighPrediction: number): ParcelsTableRowBuilder {
    this._row.public_lead_high_prediction = publicLeadHighPrediction;
    return this;
  }

  privateLeadLowPrediction(privateLeadLowPrediction: number): ParcelsTableRowBuilder {
    this._row.private_lead_low_prediction = privateLeadLowPrediction;
    return this;
  }

  privateLeadHighPrediction(privateLeadHighPrediction: number): ParcelsTableRowBuilder {
    this._row.private_lead_high_prediction = privateLeadHighPrediction;
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
        name: 'city',
        value: { stringValue: this._row.city },
      },
      {
        name: 'public_lead_low_prediction',
        value: { doubleValue: this._row.public_lead_low_prediction },
      },
      {
        name: 'public_lead_high_prediction',
        value: { doubleValue: this._row.public_lead_high_prediction },
      },
      {
        name: 'private_lead_low_prediction',
        value: { doubleValue: this._row.private_lead_low_prediction },
      },
      {
        name: 'private_lead_high_prediction',
        value: { doubleValue: this._row.private_lead_high_prediction },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom.toString() },
      },
    ];
  }
}
