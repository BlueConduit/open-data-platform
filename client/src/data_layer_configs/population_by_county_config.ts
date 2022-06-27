import { DataLayer, DataSourceType, LegendInfo, PopupInfo } from '@/model/data_layer';
import { Expression, FillLayer } from 'mapbox-gl';
import { colorMapToBuckets } from '@/util/data_layer_util';

const ID: string = 'epa-population-by-county';

const LEGEND_COLOR_MAPPING = [
  0,
  '#E1F5FE',
  10000,
  '#B3E5FC',
  25000,
  '#81D4FA',
  50000,
  '#4FC3F7',
  100000,
  '#29B6F6',
  200000,
  '#0288D1',
  500000,
  '#01579B',
  750000,
  '#0D47A1',
  1000000,
  '#303F9F',
  2000000,
  '#1A237E',
];

/**
 * Mapbox expression which interpolates pairs of bucket 'stops' + colors to produce continuous
 * results for the map.
 *
 *  See https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate.
 */
const populationInterpolation: Expression = [
  'interpolate',
  ['linear'],
  ['get', 'population_served_count'],
  ...LEGEND_COLOR_MAPPING,
];

const styleLayer: FillLayer = {
  id: `${ID}-style`,
  source: ID,
  type: 'fill',
  paint: {
    'fill-color': populationInterpolation,
    'fill-opacity': 0.75,
    'fill-outline-color': '#164E87',
  },
  layout: {
    // Make the layer hidden by default.
    visibility: 'none',
  },
};

const legendInfo: LegendInfo = {
  title: 'Population Served',
  bucketMap: colorMapToBuckets(LEGEND_COLOR_MAPPING),
};

// TODO: replace with actual popup values.
const popupInfo: PopupInfo = {
  title: 'County',
  subtitle: '320 estimated lead service lines',
  detailsTitle: 'Lead & Copper Rule Violations',
  featureProperties:
    [
      { label: 'Lead & Copper Rule Violations', name: 'Lead and Copper Rule' },
    ],
};

export const populationByCountyDataLayer: DataLayer = {
  id: ID,
  name: 'Population',
  source: {
    type: DataSourceType.GeoJson,
    data: '',
  },
  legendInfo: legendInfo,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
};
