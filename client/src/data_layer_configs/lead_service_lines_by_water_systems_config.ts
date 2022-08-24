import {
  DataSourceType,
  FeaturePropertyDataType,
  GeographicLevel,
  LegendInfo,
  MapLayer,
  PopupInfo,
  TileDataLayer,
} from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';
import { getLegendBucketsAsList, tileServerHost } from '@/util/data_layer_util';
import prefixes from '../../../cdk/src/open-data-platform/frontend/url-prefixes';

const DEFAULT_NULL_COLOR = '#d3d3d3';
const TABLE_NAME = 'public.lead_connections_function_source';

const LEGEND_VALUES = [
  {
    bucketValue: 0,
    bucketColor: '#9fcd7c',
  },
  {
    bucketValue: 25,
    bucketColor: '#f7e5af',
  },
  {
    bucketValue: 33,
    bucketColor: '#f9bd64',
  },
  {
    bucketValue: 50,
    bucketColor: '#f4a163',
  },
  {
    bucketValue: 60,
    bucketColor: '#ff5934',
  },
  {
    bucketValue: 75,
    bucketColor: '#d73819',
  },
];

// The only aggregations for water system is state.
// Because the legend is shown in percentages, the legend does not need to
// change at higher zooms.
const legend = new Map([
  [
    GeographicLevel.State,
    {
      title: 'Percentage of service lines estimated to be lead',
      buckets: LEGEND_VALUES,
      bucketLabelType: FeaturePropertyDataType.Percentage,
    },
  ],
]);

const percentLeadLines = [
  '*',
  100,
  ['/', ['get', 'lead_connections_count'], ['get', 'service_connections_count']],
];

/**
 * Mapbox expression which interpolates pairs of bucket 'stops' + colors to produce continuous
 * results for the map.
 *
 *  See https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate.
 */
const leadConnectionLegendInterpolation = [
  'interpolate',
  ['linear'],
  // Provides ratio of lead service lines : total service lines.
  percentLeadLines,
  ...getLegendBucketsAsList(LEGEND_VALUES),
];

export const styleLayer: FillLayer = {
  id: `${MapLayer.LeadServiceLineByWaterSystem}-style`,
  source: MapLayer.LeadServiceLineByWaterSystem,
  // Corresponds to the table in the database.
  'source-layer': TABLE_NAME,
  type: 'fill',
  paint: {
    'fill-color': [
      'case',
      ['==', ['get', 'lead_connections_count'], null],
      DEFAULT_NULL_COLOR,
      ['==', ['get', 'lead_connections_count'], 0],
      DEFAULT_NULL_COLOR,
      leadConnectionLegendInterpolation,
    ],
    'fill-opacity': 0.75,
  },
  layout: {
    // Make the layer hidden by default.
    visibility: 'none',
  },
};

const popupInfo: PopupInfo = {
  title: 'Water system',
  subtitle: 'Estimated lead service lines',
  detailsTitle: 'Water system information',
  featureProperties: [
    {
      label: 'State name',
      name: 'state_name',
      dataType: FeaturePropertyDataType.String,
      optional: true,
    },
    {
      label: 'EPA identifier for water system',
      name: 'pws_id',
      dataType: FeaturePropertyDataType.String,
      optional: true,
    },
    {
      label: 'Number of lead connections',
      name: 'lead_connections_count',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'Number of service lines',
      name: 'service_connections_count',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'Population served',
      name: 'population_served',
      dataType: FeaturePropertyDataType.Number,
    },
  ],
};

export const leadServiceLinesByWaterSystemLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/${prefixes.tileServer}/rpc/${TABLE_NAME}/{z}/{x}/{y}.pbf`],
    // Helps with latency to reduce fetching unneeded tiles.
    minzoom: 3,
    maxzoom: 16,
  },
  id: MapLayer.LeadServiceLineByWaterSystem,
  name: 'Lead Service Lines',
  legendInfo: legend,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
  visibleInSearchBar: true,
};
