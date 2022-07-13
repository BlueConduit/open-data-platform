import {DataSourceType, FeaturePropertyDataType, LegendInfo, MapLayer, PopupInfo, TileDataLayer} from '@/model/data_layer';
import {FillLayer} from 'mapbox-gl';
import {colorMapToBuckets, tileServerHost} from '@/util/data_layer_util';

const DEFAULT_NULL_COLOR = '#d3d3d3';

/**
 * Maps legend buckets to the hex values.
 */
const LEGEND_COLOR_MAPPING = [
  0,
  '#9fcd7c',
  5,
  '#f7e5af',
  38,
  '#f4a163',
  99.7,
  '#ff5934',
  99.9,
  '#d73819',
];

/**
 * Maps feature property values to colors to be rendered on the map.
 */
const INTERPOLATION_COLOR_MAPPING = [
  0,
  '#9fcd7c',
  0.05,
  '#f7e5af',
  0.38,
  '#f4a163',
  0.997,
  '#ff5934',
  0.999,
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
  // Provides ratio of lead service lines : total service lines.
  ['get', 'public_lead_prediction'],
  ...INTERPOLATION_COLOR_MAPPING,
];

const legendInfo: LegendInfo = {
  title: 'Percentage estimate of service line being lead',
  bucketMap: colorMapToBuckets(LEGEND_COLOR_MAPPING),
};

export const styleLayer: FillLayer = {
  id: `${MapLayer.LeadServiceLineByParcel}-style`,
  source: MapLayer.LeadServiceLineByParcel,
  // Corresponds to the table in the database.
  'source-layer': 'public.parcels',
  type: 'fill',
  paint: {
    'fill-color': [
      'case',
      ['==', ['get', 'public_lead_prediction'], null],
      DEFAULT_NULL_COLOR,
      leadConnectionLegendInterpolation,
    ],
    'fill-opacity': 0.75,
  },
  layout: {
    // Make the layer visible by default.
    visibility: 'none',
  },
};

const popupInfo: PopupInfo = {
  title: 'Home',
  subtitle: 'Lead likelihood',
  detailsTitle: 'Percentage likelihood that the public service lines contain lead.',
  featureProperties: [
    {
      label: 'Home address',
      name: 'address',
      dataType: FeaturePropertyDataType.Address,
    },
    {
      label: 'Lead likelihood',
      name: 'public_lead_prediction',
      dataType: FeaturePropertyDataType.Percentage,
    },
  ],
};

export const leadServiceLinesByParcelLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/tiles/v1/public.parcels/{z}/{x}/{y}.pbf`],
  },
  id: MapLayer.LeadServiceLineByParcel,
  name: 'Lead Service Line Estimate (Home)',
  legendInfo: legendInfo,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
  visibleInSearchBar: false,
};