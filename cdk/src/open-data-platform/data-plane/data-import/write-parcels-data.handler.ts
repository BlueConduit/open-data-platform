import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
// import { ConnectionPool, Queryable, sql } from '@databases/pg';
// import { connectToDb } from '../schema/schema.handler';

// const { chain } = require('stream-chain');
// const { streamArray } = require('stream-json/streamers/StreamArray');
// const Batch = require('stream-json/utils/Batch');
// const Pick = require('stream-json/filters/Pick');

const S3 = new AWS.S3();

/**
 * Parses a geojson file.
 */
export async function handler(_: APIGatewayProxyEvent) {
  console.log('Starting!');

  const s3Params = {
    Bucket: 'opendataplatformapistaticdata',
    Key: 'toledo_parcel_preds.geojson',
  };

  const fileStream = S3.getObject(s3Params).createReadStream();

  console.log('got read stream!');

  // Wrap this in a promise so the Lambda doesn't return before it hears back from S3.
  return new Promise((resolve, reject) => {
    let firstBatch = true;
    fileStream
      .on('data', (batch: any[]) => {
        console.log('DATA!');
        if (firstBatch) {
          console.log('batch:', batch.toString());
          firstBatch = false;
        }
        resolve(null);
      })
      .on('error', (error: Error) => {
        console.log(error);
        reject();
      })
      // Gets called by pipeline.destroy()
      .on('close', async (error: Error) => {
        console.log(error);
        reject();
      })
      .on('end', async () => {
        console.log('done');
      });
  });
}
