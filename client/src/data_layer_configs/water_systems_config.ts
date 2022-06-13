import { DataSourceType, LegendInfo, PopupInfo, TileDataLayer } from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';
import { colorMapToBuckets, tileServerHost } from '@/util/data_layer_util';

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

const popupInfo: PopupInfo = {
  title: 'Water system',
  subtitle: 'Estimated lead service lines',
  detailsTitle: 'Water system information',
  featurePropertyLabelMap: new Map<string, string>(
    [
      ['lead_connections_count', 'Number of lead connections'],
      ['pws_id', 'PWSID'],
    ]),
};

export const leadServiceLinesByWaterSystemLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/tiles/v1/public.water_systems/{z}/{x}/{y}.pbf`],
  },
  id: ID,
  name: 'Water systems',
  legendInfo: legendInfo,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
};
