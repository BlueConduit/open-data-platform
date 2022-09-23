import {
  DataSourceType,
  FeaturePropertyDataType,
  GeographicLevel,
  MapLayer,
  PopupInfo,
  TileDataLayer,
} from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';
import { getLegendBucketsAsList, tileServerHost } from '@/util/data_layer_util';
import prefixes from '../../../cdk/src/open-data-platform/frontend/url-prefixes';

// TODO(kailamjeter): move from lead likelihood % -> known / not likely / high likely etc.

const DEFAULT_NULL_COLOR = '#d3d3d3';
const TABLE_NAME = 'public.parcels';

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

const legend = new Map([
  [
    GeographicLevel.Parcel,
    {
      title: 'Percentage of service lines estimated to be lead',
      buckets: LEGEND_VALUES,
      bucketLabelType: FeaturePropertyDataType.Percentage,
    },
  ],
]);

const percentLeadLikelihood = ['*', 100, ['get', 'public_lead_connections_low_estimate']];

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
  percentLeadLikelihood,
  ...getLegendBucketsAsList(LEGEND_VALUES),
];

export const styleLayer: FillLayer = {
  id: `${MapLayer.LeadServiceLineByParcel}-style`,
  source: MapLayer.LeadServiceLineByParcel,
  // Corresponds to the table in the database.
  'source-layer': TABLE_NAME,
  type: 'fill',
  paint: {
    'fill-color': [
      'case',
      ['==', ['get', 'public_lead_connections_low_estimate'], null],
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
      label: 'Likelihood of lead',
      name: 'public_lead_connections_low_estimate',
      dataType: FeaturePropertyDataType.Percentage,
    },
  ],
};

export const leadServiceLinesByParcelLayer: TileDataLayer = {
  source: {
    type: DataSourceType.Vector,
    tiles: [`https://${tileServerHost()}/${prefixes.tileServer}/${TABLE_NAME}/{z}/{x}/{y}.pbf`],
  },
  id: MapLayer.LeadServiceLineByParcel,
  name: 'Lead Service Line Estimate (Home)',
  legendInfo: legend,
  popupInfo: popupInfo,
  styleLayer: styleLayer,
  visibleInSearchBar: false,
};
