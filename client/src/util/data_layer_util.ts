import {
  FeaturePropertyDataType,
  GeographicLevel,
  LegendBucketData,
  LegendInfo,
} from '@/model/data_layer';

/**
 * Adds a bucketLabel to a legends bucket based on its data type.
 * @param legend: has information on the data type for the buckets.
 */
const formatLegendBucket = (legend: LegendInfo | undefined): Array<LegendBucketData> => {
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
 * Return the [GeographicLevel] for a given zoom value.
 * @param legends: the map of legends available
 * @param zoom: zoom level. Each geographic level enum is inherently
 * assigned to an enum value.
 */
const getLegendForZoomLevel = (
  legends: Map<GeographicLevel, LegendInfo>,
  zoom: number,
): LegendInfo | undefined => {
  // This looks for the first qualifying zoom.
  const mostGranularLegendForZoom = Object.values(GeographicLevel)
    .reverse()
    .find((level) => level <= zoom && legends.has(level as GeographicLevel)) as GeographicLevel;
  return legends.get(mostGranularLegendForZoom);
};

/**
 * The "interpolate" expression in Mapbox requires number: color formatting
 * to identify buckets
 * https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate
 * @param buckets to use for interpolation.
 */
const getLegendBucketsAsList = (buckets: LegendBucketData[]): Array<any> => {
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
function tileServerHost() {
  return location.hostname == LOCALHOST
    ? process.env.VUE_APP_DEFAULT_TILESERVER_HOST
    : location.hostname;
}

export { formatLegendBucket, getLegendForZoomLevel, getLegendBucketsAsList, tileServerHost };
