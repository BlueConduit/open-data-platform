import { DataLayer, LegendInfo } from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';

const ID: string = 'water-systems';

const LEGEND_COLOR_MAP = {
  0: '#9fcd7c',
  25: '#ffe799',
  50: '#f4a163',
  75: '#ff5934',
  100: '#d73819',
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
  title: 'Number of lead service lines',
  bucketMap: new Map(Object.entries(LEGEND_COLOR_MAP)),
};

export const leadServiceLinesByWaterSystemLayer: DataLayer = {
  id: ID,
  name: 'Water systems',
  data: '',
  legendInfo: LEGEND_INFO,
  styleLayer: STYLE_LAYER,
};
