import {
  DataSourceType,
  FeaturePropertyDataType,
  LegendInfo,
  MapLayer,
  PopupInfo,
  TileDataLayer,
} from '@/model/data_layer';
import { Expression, FillLayer } from 'mapbox-gl';
import { colorMapToBuckets, tileServerHost } from '@/util/data_layer_util';

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
 * Mapbox expression which interpolates pairs of bucket 'stops' + colors to produce continuous
 * results for the map.
 *
 *  See https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#interpolate.
 */
const leadAndCopperViolationsInterpolation: Expression = [
  'interpolate',
  ['linear'],
  ['get', 'violations_per_service_line'],
  ...LEGEND_COLOR_MAPPING,
];

const legendInfo: LegendInfo = {
  title: 'Number of violations',
  bucketMap: colorMapToBuckets(LEGEND_COLOR_MAPPING),
};

const styleLayer: FillLayer = {
  id: `${MapLayer.LeadAndCopperRuleViolationsByWaterSystem}-style`,
  source: MapLayer.LeadAndCopperRuleViolationsByWaterSystem,
  // Corresponds to the table in the database.
  'source-layer': 'public.violation_counts',
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
  title: 'Water system',
  subtitle: '320 estimated lead service lines',
  detailsTitle: 'Lead & Copper Rule Violations',
  featureProperties: [
    {
      label: 'Lead & Copper Rule Violations Per Service Line',
      name: 'violations_per_service_line',
      dataType: FeaturePropertyDataType.Number,
    },
  ],
};

export const leadAndCopperViolationsByCountyDataLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/tiles/v1/public.violation_counts/{z}/{x}/{y}.pbf`],
  },
  id: MapLayer.LeadAndCopperRuleViolationsByWaterSystem,
  name: 'Lead & Copper Rule Violations',
  legendInfo: legendInfo,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
};
