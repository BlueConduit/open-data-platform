import {
  DataSourceType,
  FeaturePropertyDataType,
  GeographicLevel,
  LegendInfo,
  MapLayer,
  PopupInfo,
  TileDataLayer,
} from '@/model/data_layer';
import { Expression, FillLayer } from 'mapbox-gl';
import { getLegendBucketsAsList, tileServerHost } from '@/util/data_layer_util';

const DEFAULT_NULL_COLOR = '#d3d3d3';
const TABLE_NAME = 'public.violations_function_source';

// TODO(kailamjeter): create separate legends for state / water system views.
const LEGEND_VALUES = [
  {
    bucketValue: 0,
    bucketColor: '#FFEAE5',
  },
  {
    bucketValue: 1,
    bucketColor: '#FFAB99',
  },
  {
    bucketValue: 5,
    bucketColor: '#FF9680',
  },
  {
    bucketValue: 10,
    bucketColor: '#FF8166',
  },
  {
    bucketValue: 15,
    bucketColor: '#FF5733',
  },
];

const createLegends = (): Map<GeographicLevel, LegendInfo> => {
  const stateLegendInfo = {
    title: 'Percent of service lines estimated to be lead',
    buckets: LEGEND_VALUES,
    bucketLabelType: FeaturePropertyDataType.Number,
  };

  return new Map([[GeographicLevel.State, stateLegendInfo]]);
};

/**
 * Mapbox expression which interpolates pairs of bucket 'stops' + colors to produce continuous
 * results for the map.
 *
 *  See https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate.
 */
const leadAndCopperViolationsInterpolation: Expression = [
  'interpolate',
  ['linear'],
  ['get', 'violation_count'],
  ...getLegendBucketsAsList(LEGEND_VALUES),
];

const styleLayer: FillLayer = {
  id: `${MapLayer.LeadAndCopperRuleViolationsByWaterSystem}-style`,
  source: MapLayer.LeadAndCopperRuleViolationsByWaterSystem,
  // Corresponds to the table in the database.
  'source-layer': TABLE_NAME,
  type: 'fill',
  paint: {
    'fill-color': [
      'case',
      ['==', ['get', 'violation_count'], null],
      DEFAULT_NULL_COLOR,
      leadAndCopperViolationsInterpolation,
    ],
    'fill-opacity': 0.75,
    'fill-outline-color': '#B2391F',
  },
  layout: {
    // Make the layer hidden by default.
    visibility: 'none',
  },
};

const popupInfo: PopupInfo = {
  title: 'Water system',
  subtitle: '',
  detailsTitle: 'Lead & Copper Rule Violations',
  featureProperties: [
    {
      label: 'Lead & Copper Rule Violations Per Service Line',
      name: 'violation_count',
      dataType: FeaturePropertyDataType.Number,
    },
  ],
};

export const leadAndCopperViolationsByCountyDataLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/tiles/v1/rpc/${TABLE_NAME}/{z}/{x}/{y}.pbf`],
    // Helps with latency to reduce fetching unneeded tiles.
    minzoom: 3,
    maxzoom: 16,
  },
  id: MapLayer.LeadAndCopperRuleViolationsByWaterSystem,
  name: 'Lead & Copper Rule Violations',
  legendInfo: createLegends(),
  popupInfo: popupInfo,
  styleLayer: styleLayer,
  visibleInSearchBar: true,
};
