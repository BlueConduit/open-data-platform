import { FeaturePropertyDataType, LegendBucketData, LegendInfo } from '@/model/data_layer';

export const formatLegendBucket = (legend: LegendInfo | undefined): Array<LegendBucketData> => {
  legend?.buckets?.forEach((bucket) => {
    switch (legend.bucketLabelType) {
      case FeaturePropertyDataType.String: {
        bucket.bucketLabel = bucket.bucketValue ?? '';
        break;
      }
      case FeaturePropertyDataType.Number: {
        bucket.bucketLabel = parseFloat(bucket.bucketValue ?? '0').toLocaleString();
        break;
      }
      case FeaturePropertyDataType.Percent: {
        bucket.bucketLabel = `${parseFloat(bucket.bucketValue ?? '0').toLocaleString()} %`;
        break;
      }
      default: {
        bucket.bucketLabel = bucket.bucketValue ?? 'N/A';
        break;
      }
    }
  });
  return legend?.buckets ?? new Array<LegendBucketData>();
};

export const getLegendBucketsAsList = (buckets: LegendBucketData[]): Array<any> => {
  const bucketToValues = [];
  for (const bucket of buckets) {
    bucketToValues.push(bucket.bucketValue, bucket.bucketColor);
  }
  return bucketToValues;
};

const LOCALHOST = 'localhost';

/**
 * Hostname of tileserver to be passed to mapbox.
 *
 * Returns location.hostname unless app is being run locally.
 */
export function tileServerHost() {
  return location.hostname == LOCALHOST
    ? process.env.VUE_APP_DEFAULT_TILESERVER_HOST
    : location.hostname;
}
