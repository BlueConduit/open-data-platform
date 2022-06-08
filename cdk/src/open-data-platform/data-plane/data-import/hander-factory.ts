import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConnectionPool } from '@databases/pg';
import * as AWS from 'aws-sdk';
import { connectToDb } from '../schema/schema.handler';

// These libraries don't have types, so they are imported in a different way.
const { chain } = require('stream-chain');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Batch = require('stream-json/utils/Batch');
const Pick = require('stream-json/filters/Pick');

const S3 = new AWS.S3();

/**
 * Builds a lambda handler that parses a GeoJSON file and executes a callback.
 * @param s3Params - Details for how to get the GeoJSON file.
 * @param callback - Function that operates on a single element from the file.
 * @param numberOfRowsToWrite - Row limit, which can be used for testing.
 * @returns
 */
export const geoJsonHanderFactory = (
  s3Params: AWS.S3.GetObjectRequest,
  callback: (row: any, db: ConnectionPool) => Promise<void>,
  numberOfRowsToWrite: number = Infinity,
): ((event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>) => {
  /**
   * Reads an GeoJSON file and performs the callback on each element. This does not handle any
   * processing of the data itself, but provides a DB connection to the callback to process it.
   *
   * TODO: track how many rows were processed and avoid re-importing the old rows.
   *
   * @param db - Connection pool to the DB, made available to the callback.
   * @returns
   */
  const readGeoJsonFile = (db: ConnectionPool): Promise<number> =>
    new Promise((resolve, reject) => {
      const batchSize = 10;
      let numberRows = 0;

      console.log('Starting to process file in S3:', s3Params);

      const fileStream = S3.getObject(s3Params).createReadStream();
      let pipeline = chain([
        fileStream,
        Pick.withParser({ filter: 'features' }),
        streamArray(),
        new Batch({ batchSize }),
      ]);

      pipeline
        .on('data', async (batch: any[]) => {
          console.log(`Processing batch. ${numberRows} rows have been read so far.`);
          if (numberRows < numberOfRowsToWrite) {
            // Pause reads while inserting into db.
            pipeline.pause();
            await Promise.all(
              batch.map(async (data) => {
                await callback(data, db);
                ++numberRows;
              }),
            );
            pipeline.resume();
          } else {
            // Stop reading stream if numberOfRowsToWrite has been met.
            console.log('Stopping after row write limit:', numberOfRowsToWrite);
            pipeline.destroy();
          }
        })
        .on('error', (error: Error) => {
          reject(error);
        })
        // Gets called by pipeline.destroy()
        .on('close', async (_: Error) => {
          resolve(numberRows);
        })
        .on('end', async () => {
          resolve(numberRows);
        });
    });

  /**
   * Constructed handler that imports GeoJSON data to a DB.
   */
  const handler = async (_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const db = await connectToDb();
    if (db == undefined) {
      throw Error('Unable to connect to db');
    }
    let numberRows = 0;
    try {
      // Remove existing rows before inserting new ones.
      numberRows = await readGeoJsonFile(db);
    } catch (error) {
      console.log('Error:' + error);
      throw error;
    } finally {
      console.log('Disconnecting from db...');
      await db?.dispose();
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ 'Added rows': numberRows }),
    };
  };

  return handler;
};
