import { DataSourceType, GeoJsonDataLayer, LegendInfo, PopupInfo } from '@/model/data_layer';
import { Expression, FillLayer } from 'mapbox-gl';
import { colorMapToBuckets } from '@/util/data_layer_util';

const ID: string = 'epa-lead-and-copper-violations';

const LEGEND_COLOR_MAPPING = [
  0,
  '#FFEAE5',
  25,
  '#FFAB99',
  50,
  '#FF9680',
  75,
  '#FF8166',
  100,
  '#FF5733',
];

/**
 * Directions on how to map violations count to a bucket and color on the map.
 */
const leadAndCopperViolationsInterpolation: Expression = [
  'interpolate',
  ['linear'],
  ['get', 'Lead and Copper Rule'],
  ...LEGEND_COLOR_MAPPING,
];

const legendInfo: LegendInfo = {
  title: 'Number of violations',
  bucketMap: colorMapToBuckets(LEGEND_COLOR_MAPPING),
};

const styleLayer: FillLayer = {
  id: `${ID}-style`,
  source: ID,
  type: 'fill',
  paint: {
    'fill-color': leadAndCopperViolationsInterpolation,
    'fill-opacity': 0.75,
    'fill-outline-color': '#B2391F',
  },
  layout: {
    // Make the layer hidden by default.
    visibility: 'none',
  },
};

const popupInfo: PopupInfo = {
  title: 'County',
  subtitle: '320 estimated lead service lines',
  detailsTitle: 'Lead & Copper Rule Violations',
  featurePropertyLabelMap: new Map<string, string>(
    [['Lead and Copper Rule', 'Lead & Copper Rule Violations']]),
};

export const leadAndCopperViolationsByCountyDataLayer: GeoJsonDataLayer = {
  id: ID,
  name: 'Lead & Copper Rule Violations',
  source: {
    type: DataSourceType.GeoJson,
    data: '',
  },
  legendInfo: legendInfo,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
};
