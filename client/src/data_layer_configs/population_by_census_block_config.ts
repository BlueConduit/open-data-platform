import { DataSourceType, FeaturePropertyDataType, LegendInfo, MapLayer, PopupInfo, TileDataLayer } from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';
import { getLegendBucketsAsList, tileServerHost } from '@/util/data_layer_util';

const DEFAULT_NULL_COLOR = '#d3d3d3';
const ONE_MILLION = 1000000;
const TEN_THOUSAND = 10000;
const TABLE_NAME = 'public.demographics_function_source';

const LEGEND_VALUES_STATES = [
  {
    bucketValue: 0,
    bucketColor: '#D1E4F2',
  },
  {
    bucketValue: ONE_MILLION,
    bucketColor: '#C7E0F8',
  },
  {
    bucketValue: ONE_MILLION * 2,
    bucketColor: '#76bbfe',
  },
  {
    bucketValue: ONE_MILLION * 5,
    bucketColor: '#4786c9',
  },
  {
    bucketValue: ONE_MILLION * 10,
    bucketColor: '#164E87',
  },
  {
    bucketValue: ONE_MILLION * 20,
    bucketColor: '#0B2553',
  },
];

// TODO (breuch): automate this. Right now the mathematical relationship
// between LEGEND_VALUES_STATES and LEGEND_VALUES_COUNTY is not yet clear.
export const LEGEND_VALUES_COUNTY = [
  {
    bucketValue: 0,
    bucketColor: '#D1E4F2',
  },
  {
    bucketValue: TEN_THOUSAND * 3,
    bucketColor: '#C7E0F8',
  },
  {
    bucketValue: TEN_THOUSAND * 5,
    bucketColor: '#76bbfe',
  },
  {
    bucketValue: TEN_THOUSAND * 10,
    bucketColor: '#4786c9',
  },
  {
    bucketValue: TEN_THOUSAND * 20,
    bucketColor: '#164E87',
  },
  {
    bucketValue: TEN_THOUSAND * 50,
    bucketColor: '#0B2553',
  },
];

const legendInfo: LegendInfo = {
  title: 'U.S. Census data',
  buckets: LEGEND_VALUES_STATES,
  bucketLabelType: FeaturePropertyDataType.Number,
};

const nullInterpolation = ['case', ['==', ['get', 'total_population'], null], DEFAULT_NULL_COLOR];
const totalPopulationInterpolation = ['interpolate', ['linear'], ['get', 'total_population']];

/**
 * Mapbox expression which interpolates pairs of bucket 'stops' + colors to produce continuous
 * results for the map.
 *
 *  See https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate.
 */
const legendInterpolation = [
  ...nullInterpolation,
  [...totalPopulationInterpolation, ...getLegendBucketsAsList(LEGEND_VALUES_STATES)],
];

const legendInterpolationCounty = [
  ...nullInterpolation,
  [...totalPopulationInterpolation, ...getLegendBucketsAsList(LEGEND_VALUES_COUNTY)],
];

export const styleLayer: FillLayer = {
  id: `${MapLayer.PopulationByCensusBlock}-style`,
  source: MapLayer.PopulationByCensusBlock,
  // Corresponds to the table in the database.
  'source-layer': TABLE_NAME,
  type: 'fill',
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['zoom'],
      // For state-level zoom, interpolate based on state buckets.
      4,
      legendInterpolation,
      // For county-level zoom, interpolate based on county buckets.
      5,
      legendInterpolationCounty,
    ],
    'fill-opacity': 0.75,
    'fill-outline-color': '#6433FF',
  },
  layout: {
    // Make the layer hidden by default.
    visibility: 'none',
  },
};

// TODO(kailamjeter): finalize content https://app.shortcut.com/blueconduit/story/5682/cleanup-fe.
// TODO(breuch): Update all values to percentages for better readability.
const popupInfo: PopupInfo = {
  title: 'U.S. demographic information',
  subtitle: 'Data derived from U.S. Census data',
  detailsTitle: 'Demographic information',
  featureProperties: [
    {
      label: 'Total residents',
      name: 'total_population',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'Residents under the age of 5',
      name: 'under_five_population',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'White residents',
      name: 'white_population',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'Black residents',
      name: 'black_population',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'Residents living in poverty',
      name: 'poverty_population',
      dataType: FeaturePropertyDataType.Number,
    },
  ],
};

export const populationDataByCensusBlockLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/tiles/v1/rpc/${TABLE_NAME}/{z}/{x}/{y}.pbf`],
    // Helps with latency to reduce fetching unneeded tiles.
    minzoom: 3,
    maxzoom: 16,
  },
  id: MapLayer.PopulationByCensusBlock,
  name: 'Population',
  // TODO (breuch): Update based on zoom.
  legendInfo: legendInfo,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
  visibleInSearchBar: true,

};
