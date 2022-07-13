import { FeaturePropertyDataType, LegendBucketData, LegendInfo } from '@/model/data_layer';

/**
 * Adds a bucketLabel to a legends bucket based on its data type.
 * @param legend: has information on the data type for the buckets.
 */
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
      case FeaturePropertyDataType.Percentage: {
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

/**
 * The "interpolate" expression in Mapbox requires number: color formatting
 * to identify buckets
 * https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate
 * @param buckets to use for interpolation.
 */
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
