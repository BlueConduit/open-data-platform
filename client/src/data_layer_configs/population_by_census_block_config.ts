import { DataSourceType, LegendInfo, PopupInfo, TileDataLayer } from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';
import { colorMapToBuckets, tileServerHost } from '@/util/data_layer_util';

const ID: string = 'population-by-census-block';
const DEFAULT_NULL_COLOR = '#d3d3d3';
const TABLE_NAME = 'public.demographics';

/**
 * Maps legend buckets to the hex values.
 */
const LEGEND_COLOR_MAPPING = [
  0,
  '#ECE5FF',
  800,
  '#D8CCFF',
  1200,
  '#B299FF',
  1700,
  '#9E80FF',
  2200,
  '#8B66FF',
  2700,
  '#774DFF',
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
  ...LEGEND_COLOR_MAPPING,
];

const legendInfo: LegendInfo = {
  title: 'Population by census block',
  bucketMap: colorMapToBuckets(LEGEND_COLOR_MAPPING),
};

export const styleLayer: FillLayer = {
  id: `${ID}-style`,
  source: ID,
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

// TODO(kailamjeter): finalize fields formatting and remove excess content.
const popupInfo: PopupInfo = {
  title: 'Census block',
  subtitle: 'ACS Census block data',
  detailsTitle: 'Demographic information',
  featureProperties:
    [
      { label: 'Geographic identifier (GEOID)', name: 'census_geo_id' },
      { label: 'Block name', name: 'census_block_name' },
      { label: 'Total population', name: 'total_population' },
      { label: 'Population under the age of 5', name: 'under_five_population' },
      { label: 'White population', name: 'white_population' },
      { label: 'Black population', name: 'black_population' },
      { label: 'Population in poverty', name: 'poverty_population' },
    ],
};

export const populationDataByCensusBlockLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/tiles/v1/${TABLE_NAME}/{z}/{x}/{y}.pbf`],
  },
  id: ID,
  name: 'Population',
  legendInfo: legendInfo,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
};
