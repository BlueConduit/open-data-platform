// TODO: Modify the violations handler to use handler-factoy.ts.

import { SqlParametersList } from 'aws-sdk/clients/rdsdataservice';

/**
 * Single row for violations table.
 */
class ViolationsTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Water system identifier.
  violation_id: string;
  // Water system identifier.
  pws_id: string;
  // Code for the violation.
  violation_code: string;
  // Status of violation.
  compliance_status: string;
  // Date the violation began in the form of YYYY-mm-dd.
  start_date: string;
  // Date the violation went back into compliance in the form of YYYY-mm-dd.
  // Could be null for ongoing violations.
  end_date?: string;

  constructor(
    pws_id: string,
    violation_id: string,
    violation_code: string,
    compliance_status: string,
    start_date: string,
    end_date: string,
  ) {
    this.pws_id = pws_id;
    this.violation_id = violation_id;
    this.violation_code = violation_code;
    this.compliance_status = compliance_status;
    this.start_date = start_date;
    this.end_date = end_date;
  }
}

/**
 * Builder utility for rows of the violations table.
 */
class ViolationsTableRowBuilder {
  private readonly _row: ViolationsTableRow;

  constructor() {
    this._row = new ViolationsTableRow('', '', '', '', '', '');
  }

  violationId(violationId: string): ViolationsTableRowBuilder {
    this._row.violation_id = violationId;
    return this;
  }

  pwsId(pwsId: string): ViolationsTableRowBuilder {
    this._row.pws_id = pwsId;
    return this;
  }

  violationCode(violationCode: string): ViolationsTableRowBuilder {
    this._row.violation_code = violationCode;
    return this;
  }

  complianceStatus(complianceStatus: string): ViolationsTableRowBuilder {
    this._row.compliance_status = complianceStatus;
    return this;
  }

  startDate(startDate: string): ViolationsTableRowBuilder {
    this._row.start_date = startDate;
    return this;
  }

  endDate(endDate: string): ViolationsTableRowBuilder {
    this._row.end_date = endDate;
    return this;
  }

  build(): SqlParametersList {
    return [
      {
        name: 'violation_id',
        value: { stringValue: this._row.violation_id },
      },
      {
        name: 'pws_id',
        value: { stringValue: this._row.pws_id },
      },
      {
        name: 'violation_code',
        value: { stringValue: this._row.violation_code },
      },
      {
        name: 'compliance_status',
        value: { stringValue: this._row.compliance_status },
      },
      {
        name: 'start_date',
        value: { stringValue: this._row.start_date },
      },
      {
        name: 'end_date',
        value: { stringValue: this._row.end_date },
      },
    ];
  }
}

export { ViolationsTableRow, ViolationsTableRowBuilder };
