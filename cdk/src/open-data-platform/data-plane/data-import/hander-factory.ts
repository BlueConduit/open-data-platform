import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConnectionPool, Queryable, sql } from '@databases/pg';
import * as AWS from 'aws-sdk';
import { connectToDb } from '../schema/schema.handler';

const { chain } = require('stream-chain');
const { streamArray } = require('stream-json/streamers/StreamArray');
const Batch = require('stream-json/utils/Batch');
const Pick = require('stream-json/filters/Pick');

const S3 = new AWS.S3();

/**
 * Builds a lambda handler that parses a GeoJSON file and executes a callback.
 * @param s3Params - Details for how to get the GeoJSON file.
 * @param callback - Function that operates on a single element from the file.
 * @returns
 */
export const handerFactory = (
  s3Params: AWS.S3.GetObjectRequest,
  callback: (batch: any) => Promise<void>,
): ((event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>) => {
  return async function handler(_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const db = await connectToDb();
    if (db == undefined) {
      throw Error('Unable to connect to db');
    }
    let numberRows = 0;
    try {
      // Remove existing rows before inserting new ones.
      numberRows = await parseFile(s3Params, callback, Infinity);
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
};

const parseFile = (
  s3Params: AWS.S3.GetObjectRequest,
  callback: (batch: any) => Promise<void>,
  numberOfRowsToWrite: number,
): Promise<number> =>
  new Promise((resolve, reject) => {
    const batchSize = 10;
    let numberRows = 0;

    const fileStream = S3.getObject(s3Params).createReadStream();
    let pipeline = chain([
      fileStream,
      Pick.withParser({ filter: 'features' }),
      streamArray(),
      new Batch({ batchSize }),
    ]);

    pipeline
      .on('data', async (batch: any[]) => {
        if (numberRows < numberOfRowsToWrite) {
          // Pause reads while inserting into db.
          pipeline.pause();
          await Promise.all(
            batch.map(async (data) => {
              await callback(data);
              ++numberRows;
            }),
          );
          pipeline.resume();
        } else {
          // Stop reading stream if numberOfRowsToWrite has been met.
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
