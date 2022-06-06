import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConnectionPool, Queryable, sql } from '@databases/pg';
import * as AWS from 'aws-sdk';
import { connectToDb } from '../data-plane/schema/schema.handler';

const { chain } = require('stream-chain');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Pick = require('stream-json/filters/Pick');

const S3 = new AWS.S3();

const PWS_ID = 'pwsid';
const LEAD_CONNECTIONS = 'lead_connections';

/**
 * Inserts all rows into the demographics table.
 */
async function insertRows(db: ConnectionPool, rows: LeadServiceLinesTableRow[]): Promise<any[]> {
  // TODO(breuch): Replace with geom from new file.
  // This is a random polygon taken from an unmapped s3 file.
  const geometry = sql.__dangerous__rawValue(
    "ST_GeometryFromText('POLYGON((-122.76199734299996 " +
      '47.34350314200003, -122.76248119999997 47.342854930000044, ' +
      '-122.76257080699997 47.34285604200005, -122.76259517499994 ' +
      '47.34266843300003, -122.76260856299996 47.34256536000004, ' +
      '-122.76286629299995 47.34250175600005, -122.76295867599998 ' +
      '47.34242223000007, -122.76328431199994 47.34202772300006, ' +
      '-122.763359015 47.34188063000005, -122.76359184199998 ' +
      '47.34185498100004, -122.76392923599997 47.34181781500007, ' +
      '-122.76392897999995 47.34183731100006, -122.76390878299998 ' +
      '47.341839519000075, -122.76390520999996 47.34211214900006, ' +
      '-122.76390440899996 47.342173262000074, -122.763924584 ' +
      '47.34217272700005, -122.763921139 47.342407894000075, ' +
      '-122.76391819399998 47.342471904000035, -122.76390565499997 ' +
      '47.34257032900007, -122.76390536899999 47.342571914000075, ' +
      '-122.76388240099999 47.34267173100005, -122.76388191899997 ' +
      '47.34267343500005, -122.76386218299996 47.34273572600006, ' +
      '-122.76383851199995 47.34279737900005, -122.76383805499995 ' +
      '47.34279846700008, -122.76380443699998 47.34287143500006, ' +
      '-122.76376811299997 47.34293827000005, -122.763727072 ' +
      '47.343003846000045, -122.76372118599994 47.34301258000005, ' +
      '-122.763375968 47.34352033700003, -122.76328781999996 ' +
      '47.343519239000045, -122.76310988499995 47.343517020000036, ' +
      "-122.76199734299996 47.34350314200003))')",
  );

  return db.query(sql`INSERT INTO lead_service_lines (pws_id,
                                                      lead_connections_count,
                                                      geom)
                      VALUES ${sql.join(
                        rows.map((row: LeadServiceLinesTableRow) => {
                          return sql`(${row.pws_id}, ${row.lead_connections_count}, ${geometry})`;
                        }),
                        ',',
                      )};`);
}

/**
 * Inserts all rows into the demographics table.
 */
async function deleteRows(db: ConnectionPool): Promise<any[]> {
  return db.query(sql`DELETE
                      FROM lead_service_lines
                      WHERE pws_id IS NOT NULL`);
}

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
    const fileStream = S3.getObject(s3Params).createReadStream();
    const pipeline = chain([fileStream, Pick.withParser({ filter: 'features' }), streamArray()]);

    pipeline
      .on('data', (data: any) => {
        fileStream.pause();
        const properties = data['value']['properties'];
        if (count < numberRowsToWrite) {
          const row = new LeadServiceLinesTableRowBuilder()
            .pwsId(properties[PWS_ID])
            .leadConnectionsCount(Math.max(parseInt(properties[LEAD_CONNECTIONS]), 0))
            .build();
          results.push(row);
          console.log(data);
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
export async function handler(_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const numberRowsToWrite: number = parseInt(process.env.numberRows ?? '10');

  const s3Params = {
    Bucket: 'opendataplatformapistaticdata',
    Key: 'pwsid_lead_connections.geojson',
  };

  let db: ConnectionPool | undefined;

  // Read CSV file and write to demographics table.
  try {
    const rows = await parseS3IntoLeadServiceLinesTableRow(s3Params, numberRowsToWrite);
    db = await connectToDb();

    if (db == undefined) {
      throw Error('Unable to connect to db');
    }

    // Remove existing rows before inserting new ones.
    await deleteRows(db);
    const data = await insertRows(db, rows);
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    console.log('Error:' + error);
    throw error;
  } finally {
    console.log('Disconnecting from db...');
    await db?.dispose();
  }
}

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
