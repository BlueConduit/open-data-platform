import { DataSourceType, FeaturePropertyDataType, LegendInfo, MapLayer, PopupInfo, TileDataLayer } from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';
import { colorMapToBuckets, tileServerHost } from '@/util/data_layer_util';

const DEFAULT_NULL_COLOR = '#d3d3d3';

/**
 * Maps legend buckets to the hex values.
 */
const LEGEND_COLOR_MAPPING = [
  0,
  '#9fcd7c',
  0.25,
  '#f7e5af',
  0.33,
  '#f9bd64',
  0.5,
  '#f4a163',
  0.6,
  '#ff5934',
  0.75,
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
  ['/', ['get', 'lead_connections_count'], ['get', 'service_connections_count']],
  ...LEGEND_COLOR_MAPPING,
];

const legendInfo: LegendInfo = {
  title: 'Proportion of lead lines to all service lines',
  bucketMap: colorMapToBuckets(LEGEND_COLOR_MAPPING),
};

export const styleLayer: FillLayer = {
  id: `${MapLayer.LeadServiceLineByParcel}-style`,
  source: MapLayer.LeadServiceLineByParcel,
  // Corresponds to the table in the database.
  'source-layer': 'public.parcels',
  type: 'fill',
  paint: {
    'fill-color': '#f4a163',
    'fill-opacity': 0.75,
  },
  layout: {
    // Make the layer visible by default.
    visibility: 'none',
  },
};

const popupInfo: PopupInfo = {
  title: 'Water system',
  subtitle: 'Estimated lead service lines',
  detailsTitle: 'Water system information',
  featureProperties: [
    {
      label: 'Number of lead connections',
      name: 'lead_connections_count',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'Number of service lines',
      name: 'service_connections_count',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'Population served by water system',
      name: 'population_served',
      dataType: FeaturePropertyDataType.Number,
    },
    {
      label: 'EPA identifier for water system',
      name: 'pws_id',
      dataType: FeaturePropertyDataType.String,
    },
  ],
};

export const leadServiceLinesByParcelLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/tiles/v1/public.parcels/{z}/{x}/{y}.pbf`],
  },
  id: MapLayer.LeadServiceLineByParcel,
  name: 'Lead Service Lines',
  legendInfo: legendInfo,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
  visibleInSearchBar: false,
};
