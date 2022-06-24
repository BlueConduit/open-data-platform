import { RDSDataService } from 'aws-sdk';
import { geoJsonHandlerFactory } from './handler-factory';

const s3Params = {
  Bucket: 'opendataplatformapistaticdata',
  Key: 'parcels/toledo_parcel_preds.geojson',
};

export const handler = geoJsonHandlerFactory(
  s3Params,
  async (rows: any[], _: RDSDataService) => {
    console.log('Rows:', rows);
  },
  0,
  20, // limit to 20 rows for testing.
);
