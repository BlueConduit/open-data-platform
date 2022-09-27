import {
  DataSourceType,
  FeaturePropertyDataType,
  GeographicLevel,
  MapLayer,
  PopupInfo,
  TileDataLayer,
} from '@/model/data_layer';
import { FillLayer, MapboxGeoJSONFeature } from 'mapbox-gl';
import { getLegendBucketsAsList, tileServerHost } from '@/util/data_layer_util';
import prefixes from '../../../cdk/src/open-data-platform/frontend/url-prefixes';
import { GeoJsonProperties } from 'geojson';

const DEFAULT_NULL_COLOR = '#d3d3d3';
const TABLE_NAME = 'public.lead_connections_function_source';

const LEGEND_VALUES = [
  {
    bucketValue: 0,
    bucketColor: '#FFEDB3',
  },
  {
    bucketValue: 10,
    bucketColor: '#FFD74F',
  },
  {
    bucketValue: 20,
    bucketColor: '#FF9100',
  },
  {
    bucketValue: 30,
    bucketColor: '#FF6E4A',
  },
  {
    bucketValue: 50,
    bucketColor: '#BF3417',
  },
];

// The only aggregations for water system is state.
// Because the legend is shown in percentages, the legend does not need to
// change at higher zooms.
const legend = new Map([
  [
    GeographicLevel.State,
    {
      title: 'Lead service lines data',
      subheader:
        'This is measuring the percentage of services lines ' +
        'currently estimated to be lead. This information is based on either ' +
        'information reported by the water system or predictions by BlueConduit ',
      buckets: LEGEND_VALUES,
      bucketLabelType: FeaturePropertyDataType.Percentage,
    },
  ],
]);

const percentLeadLines = [
  '*',
  100,
  ['/', ['get', 'lead_connections_count'], ['get', 'service_connections_count']],
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
  percentLeadLines,
  ...getLegendBucketsAsList(LEGEND_VALUES),
];

export const styleLayer: FillLayer = {
  id: `${MapLayer.LeadServiceLineByWaterSystem}-style`,
  source: MapLayer.LeadServiceLineByWaterSystem,
  // Corresponds to the table in the database.
  'source-layer': TABLE_NAME,
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
    // Make the layer hidden by default.
    visibility: 'none',
  },
};

const popupInfo: PopupInfo = {
  title: 'Water system',
  subtitle: 'Estimated lead service lines',
  detailsTitle: 'Water system information',
  featureProperties: [
    {
      label: 'State name',
      name: 'state_name',
      dataType: FeaturePropertyDataType.String,
      optional: true,
    },
    {
      label: 'EPA identifier for water system',
      name: 'pws_id',
      dataType: FeaturePropertyDataType.String,
      optional: true,
    },
    {
      label: 'Population served',
      name: 'population_served',
      dataType: FeaturePropertyDataType.Number,
    },
  ],
  computedProperties: [
    {
      label: 'Estimated percent lead lines',
      name: 'percent_lead',
      dataType: FeaturePropertyDataType.Percentage,
      calculate: (features: GeoJsonProperties) =>
        // Avoid dividing by 0.
        features == null ||
        features.service_connections_count == null ||
        features.service_connections_count == 0
          ? null
          : features.lead_connections_count / features.service_connections_count,
    },
  ],
};

export const leadServiceLinesByWaterSystemLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/${prefixes.tileServer}/rpc/${TABLE_NAME}/{z}/{x}/{y}.pbf`],
    // Helps with latency to reduce fetching unneeded tiles.
    minzoom: 3,
    maxzoom: 16,
  },
  id: MapLayer.LeadServiceLineByWaterSystem,
  name: 'Lead Service Lines',
  legendInfo: legend,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
  visibleInSearchBar: true,
};
