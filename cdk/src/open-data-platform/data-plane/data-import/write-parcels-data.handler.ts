import { ConnectionPool } from '@databases/pg';
import { geoJsonHandlerFactory } from './handler-factory';

const s3Params = {
  Bucket: 'opendataplatformapistaticdata',
  Key: 'parcels/toledo_parcel_preds.geojson',
};

export const handler = geoJsonHandlerFactory(
  s3Params,
  async (rows: any[], _: ConnectionPool) => {
    console.log('Rows:', rows);
  },
  20, // limit to 20 rows for testing.
);
