import { DataSourceType, GeoJsonDataLayer, LegendInfo, PopupInfo } from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';

const ID: string = 'epa-lead-and-copper-violations';

const LEGEND_COLOR_MAP = {
  0: '#FFEAE5',
  25: '#FFAB99',
  50: '#FF9680',
  75: '#FF8166',
  100: '#FF5733',
};

const STYLE_LAYER: FillLayer = {
  id: `${ID}-style`,
  source: ID,
  type: 'fill',
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'Lead and Copper Rule'],
      0,
      LEGEND_COLOR_MAP[0],
      25,
      LEGEND_COLOR_MAP[25],
      50,
      LEGEND_COLOR_MAP[50],
      75,
      LEGEND_COLOR_MAP[75],
      100,
      LEGEND_COLOR_MAP[100],
    ],
    'fill-opacity': 0.75,
    'fill-outline-color': '#B2391F',
  },
  layout: {
    // Make the layer visible by default.
    visibility: 'visible',
  },
};

const LEGEND_INFO: LegendInfo = {
  title: 'Number of violations',
  bucketMap: new Map(Object.entries(LEGEND_COLOR_MAP)),
};

const POPUP_INFO: PopupInfo = {
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
  legendInfo: LEGEND_INFO,
  popupInfo: POPUP_INFO,
  styleLayer: STYLE_LAYER,
};
