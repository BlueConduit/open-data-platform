import {
  DataSourceType,
  FeaturePropertyDataType,
  GeographicLevel,
  LegendInfo,
  MapLayer,
  PopupInfo,
  TileDataLayer,
} from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';
import { getLegendBucketsAsList, tileServerHost } from '@/util/data_layer_util';

// TODO(kailamjeter): move from lead likelihood % -> known / not likely / high likely etc.

const DEFAULT_NULL_COLOR = '#d3d3d3';
const TABLE_NAME = 'public.parcels';

const LEGEND_VALUES = [
  {
    bucketValue: 0,
    bucketColor: '#9fcd7c',
  },
  {
    bucketValue: 5,
    bucketColor: '#f7e5af',
  },
  {
    bucketValue: 38,
    bucketColor: '#f4a163',
  },
  {
    bucketValue: 99.7,
    bucketColor: '#ff5934',
  },
  {
    bucketValue: 99.9,
    bucketColor: '#d73819',
  },
];

const createLegends = (): Map<GeographicLevel, LegendInfo> => {
  const parcelLegendInfo = {
    title: 'Percent of service lines estimated to be lead',
    buckets: LEGEND_VALUES,
    bucketLabelType: FeaturePropertyDataType.Percentage,
  };
  
  return new Map([[GeographicLevel.Parcel, parcelLegendInfo]]);
};

const percentLeadLikelihood = ['*', 100, ['get', 'public_lead_prediction']];

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
    tiles: [`https://${tileServerHost()}/tiles/v1/${TABLE_NAME}/{z}/{x}/{y}.pbf`],
  },
  id: MapLayer.LeadServiceLineByParcel,
  name: 'Lead Service Line Estimate (Home)',
  legendInfo: createLegends(),
  popupInfo: popupInfo,
  styleLayer: styleLayer,
  visibleInSearchBar: false,
};
