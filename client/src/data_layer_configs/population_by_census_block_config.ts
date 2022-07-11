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
const TABLE_NAME = 'public.demographics';

const LEGEND_VALUES = [
  {
    bucketValue: 0,
    bucketColor: '#ECE5FF',
  },
  {
    bucketValue: 800,
    bucketColor: '#D8CCFF',
  },
  {
    bucketValue: 1200,
    bucketColor: '#B299FF',
  },
  {
    bucketValue: 1700,
    bucketColor: '#9E80FF',
  },
  {
    bucketValue: 2200,
    bucketColor: '#8B66FF',
  },
  {
    bucketValue: 2700,
    bucketColor: '#774DFF',
  },
];

/**
 * Mapbox expression which interpolates pairs of bucket 'stops' + colors to produce continuous
 * results for the map.
 *
 *  See https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate.
 */
const legendInterpolation = [
  'interpolate',
  ['linear'],
  ['get', 'total_population'],
  ...getLegendBucketsAsList(LEGEND_VALUES),
];

const legendInfo: LegendInfo = {
  title: 'Population by census block',
  buckets: LEGEND_VALUES,
  bucketLabelType: FeaturePropertyDataType.Number,
};

export const styleLayer: FillLayer = {
  id: `${MapLayer.PopulationByCensusBlock}-style`,
  source: MapLayer.PopulationByCensusBlock,
  // Corresponds to the table in the database.
  'source-layer': TABLE_NAME,
  type: 'fill',
  paint: {
    'fill-color': [
      'case',
      ['==', ['get', 'total_population'], null],
      DEFAULT_NULL_COLOR,
      legendInterpolation,
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
const popupInfo: PopupInfo = {
  title: 'Census block',
  subtitle: 'ACS Census block data',
  detailsTitle: 'Demographic information',
  featureProperties: [
    {
      label: 'Geographic identifier (GEOID)',
      name: 'census_geo_id',
      dataType: FeaturePropertyDataType.String,
    },
    {
      label: 'Block name',
      name: 'census_block_name',
      dataType: FeaturePropertyDataType.String,
    },
    {
      label: 'Total population',
      name: 'total_population',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'Population under the age of 5',
      name: 'under_five_population',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'White population',
      name: 'white_population',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'Black population',
      name: 'black_population',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'Population in poverty',
      name: 'poverty_population',
      dataType: FeaturePropertyDataType.Number,
    },
  ],
};

export const populationDataByCensusBlockLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/tiles/v1/${TABLE_NAME}/{z}/{x}/{y}.pbf`],
  },
  id: MapLayer.PopulationByCensusBlock,
  name: 'Population',
  legendInfo: legendInfo,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
};
