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
 * Mapbox expression which interpolates pairs of bucket 'stops' + colors to produce continuous
 * results for the map.
 *
 *  See https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate.
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
  featureProperties: [
    { label: 'Number of lead connections', name: 'lead_connections_count' },
    { label: 'Number of service lines', name: 'service_connections_count' },
    { label: 'Population served by water system', name: 'population_served' },
    { label: 'EPA identifier for water system', name: 'pws_id' },
  ],
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
