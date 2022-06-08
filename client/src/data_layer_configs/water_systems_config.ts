import { DataLayer, LegendInfo } from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';

const ID: string = 'water-systems';
const DEFAULT_NULL_COLOR = '#d3d3d3';

/**
 * Maps legend buckets to the hex values.
 */
const LEGEND_COLOR_MAPPING = [
  0,
  '#9fcd7c',
  10000,
  '#f7e5af',
  25000,
  '#f9bd64',
  50000,
  '#f4a163',
  100000,
  '#ff5934',
  150000,
  '#d73819',
];

/**
 * Directions on how to map lead_connections count to a bucket and color
 * on the map.
 */
const leadConnectionLegendInterpolation = [
  'interpolate',
  ['linear'],
  ['get', 'lead_connections_count'],
  ...LEGEND_COLOR_MAPPING,
];

const legendInfo: LegendInfo = {
  title: 'Number of lead service lines',
  bucketMap: colorMapToBuckets(LEGEND_COLOR_MAPPING),
};

/**
 * Converts list of legend pairs (alternating numerical key, string hex color
 * value) to a map of legend key : color hex.
 * @param colorMapping the list of legend pairs
 *
 * Example:
 * [0, '#9fcd7c', 10000, '#f7e5af'] => {'0' :  '#9fcd7c', '10000', '#f7e5af'}
 */
function colorMapToBuckets(colorMapping: any[]): Map<string, string> {
  const listOfLegendPairs: [string, string][] = [];
  for (let index = 0; index < LEGEND_COLOR_MAPPING.length; index++) {
    if (index % 2 != 0) {
      listOfLegendPairs.push([LEGEND_COLOR_MAPPING[index - 1].toString(), colorMapping[index]]);
    }
  }
  return new Map(listOfLegendPairs);
}

export const styleLayer: FillLayer = {
  id: `${ID}-style`,
  source: ID,
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

export const leadServiceLinesByWaterSystemLayer: DataLayer = {
  id: ID,
  name: 'Water systems',
  // Data is required for DataLayer but this is not used since it relies on the
  // tileserver.
  data: '',
  legendInfo: legendInfo,
  styleLayer: styleLayer,
};
