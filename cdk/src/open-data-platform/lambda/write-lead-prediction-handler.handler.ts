import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConnectionPool } from '@databases/pg';
import * as AWS from 'aws-sdk';

const S3 = new AWS.S3();
const streamObject = require('stream-json/streamers/StreamObject');
const streamValues = require('stream-json/streamers/StreamValues');

const jsonStreamObject = streamObject.withParser();
const jsonStreamValues = streamObject.withParser();

const PWS_ID = 'pwsid';
const LEAD_CONNECTIONS = 'lead_connections';

/**
 * Reads the S3 CSV file and returns [LeadServiceLinesTableRow]s.
 */
function parseS3IntoLeadServiceLinesTableRow(
  s3Params: AWS.S3.GetObjectRequest,
  numberRowsToWrite = 10,
): Promise<Array<LeadServiceLinesTableRow>> {
  const results: LeadServiceLinesTableRow[] = [];
  return new Promise(function (resolve, reject) {
    let count = 0;
    console.log(jsonStreamValues);
    const fileStream = S3.getObject(s3Params).createReadStream();
    fileStream
      .pipe(jsonStreamObject.input)
      .on('data', (data: any) => {
        // Pause to allow for processing.
        fileStream.pause();
        if (count < numberRowsToWrite) {
          // const row = new LeadServiceLinesTableRowBuilder()
          //   .pwsId(parseJson[PWS_ID])
          //   .leadConnectionsCount(parseInt(parseJson[LEAD_CONNECTIONS]))
          //   .build();
          console.log('data is: ');
          console.log(data);
          results.push(data);
        }
        count += 1;
        fileStream.resume();
      })
      .on('error', (error: Error) => {
        reject(error);
      })
      .on('end', () => {
        console.log('Parsed ' + results.length + ' rows.');
        resolve(results);
      });
  });
}

/**
 * Parses S3 'alabama_acs_data.csv' file and writes rows
 * to demographics table in the MainCluster postgres db.
 */
exports.handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  return new Promise(async function (resolve, reject) {
    const secretArn: string = event['secretArn'];
    const numberRowsToWrite: number = event['numberRows'];

    const s3Params = {
      Bucket: 'opendataplatformapistaticdata',
      Key: 'pwsid_lead_connections.geojson',
    };

    let db: ConnectionPool | undefined;

    // Read CSV file and write to demographics table.
    try {
      const rows = await parseS3IntoLeadServiceLinesTableRow(s3Params, numberRowsToWrite);
      console.log('Found rows: ' + JSON.stringify(rows));

      resolve({ statusCode: 200, body: JSON.stringify(rows) });
    } catch (error) {
      console.log('Error:' + error);
      reject({ statusCode: 500, body: JSON.stringify(error.message) });
    } finally {
      console.log('Disconnecting from db...');
      await db?.dispose();
    }
  });
};

/**
 * Single row for lead service lines table.
 */
class LeadServiceLinesTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.
  pws_id: string;
  lead_connections_count: number;
  geom: string;

  constructor(pws_id: string, lead_connections_count: number, geom: string) {
    this.pws_id = pws_id;
    this.lead_connections_count = lead_connections_count;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the lead service lines table.
 */
class LeadServiceLinesTableRowBuilder {
  private readonly _row: LeadServiceLinesTableRow;

  constructor() {
    this._row = new LeadServiceLinesTableRow('', 0, '');
  }

  pwsId(pwsId: string): LeadServiceLinesTableRowBuilder {
    this._row.pws_id = pwsId;
    return this;
  }

  leadConnectionsCount(leadConnectionsCount: number): LeadServiceLinesTableRowBuilder {
    this._row.lead_connections_count = leadConnectionsCount;
    return this;
  }

  build(): LeadServiceLinesTableRow {
    return this._row;
  }
}
