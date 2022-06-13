import { ConnectionPool } from '@databases/pg';
import { geoJsonHandlerFactory } from './handler-factory';

const s3Params = {
  Bucket: 'opendataplatformapistaticdata',
  Key: 'toledo_parcel_preds.geojson',
};

export const handler = geoJsonHandlerFactory(
  s3Params,
  async (row: any, _: ConnectionPool) => {
    console.log('Row:', row);
  },
  20, // limit to 20 rows for testing.
);
