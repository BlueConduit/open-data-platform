import {
  DataSourceType,
  FeaturePropertyDataType,
  LegendInfo,
  MapLayer,
  PopupInfo,
  TileDataLayer,
} from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';
import { getLegendBucketsAsList, tileServerHost } from '@/util/data_layer_util';

const DEFAULT_NULL_COLOR = '#d3d3d3';

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

const legendInfo: LegendInfo = {
  title: 'Percent of service lines estimated to be lead',
  buckets: LEGEND_VALUES,
  bucketLabelType: FeaturePropertyDataType.Percent,
};

export const styleLayer: FillLayer = {
  id: `${MapLayer.LeadServiceLineByWaterSystem}-style`,
  source: MapLayer.LeadServiceLineByWaterSystem,
  // Corresponds to the table in the database.
  'source-layer': 'public.water_systems',
  type: 'fill',
  paint: {
    'fill-color': [
      'case',
      ['==', ['get', 'lead_connections_count'], null],
      DEFAULT_NULL_COLOR,
      leadConnectionLegendInterpolation,
    ],
    'fill-opacity': 0.75,
  },
  layout: {
    // Make the layer visible by default.
    visibility: 'visible',
  },
};

const popupInfo: PopupInfo = {
  title: 'Water system',
  subtitle: 'Estimated lead service lines',
  detailsTitle: 'Water system information',
  featureProperties: [
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
      label: 'Population served by water system',
      name: 'population_served',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'EPA identifier for water system',
      name: 'pws_id',
      dataType: FeaturePropertyDataType.String,
    },
  ],
};

export const leadServiceLinesByWaterSystemLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/tiles/v1/public.water_systems/{z}/{x}/{y}.pbf`],
  },
  id: MapLayer.LeadServiceLineByWaterSystem,
  name: 'Lead Service Lines',
  legendInfo: legendInfo,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
};
