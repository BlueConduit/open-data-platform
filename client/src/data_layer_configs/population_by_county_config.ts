import { DataLayer, InteractionType, LegendInfo, PopupInfo } from '@/model/data_layer';
import { FillLayer } from 'mapbox-gl';

const POPULATION_COLOR_MAP =
  {
    0:
      '#E1F5FE',
    10000:
      '#B3E5FC',
    25000:
      '#81D4FA',
    50000:
      '#4FC3F7',
    100000:
      '#29B6F6',
    200000:
      '#0288D1',
    500000:
      '#01579B',
    750000:
      '#0D47A1',
    1000000:
      '#303F9F',
    2000000:
      '#1A237E',
  };

const STYLE_LAYER: FillLayer = {
    'id': 'epa-violations-population-style',
    'source': 'epa-violations',
    'type': 'fill',
    'paint': {
        'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'population_served_count'],
            0,
            POPULATION_COLOR_MAP[0],
            10000,
            POPULATION_COLOR_MAP[10000],
            25000,
            POPULATION_COLOR_MAP[25000],
            50000,
            POPULATION_COLOR_MAP[50000],
            100000,
            POPULATION_COLOR_MAP[100000],
            200000,
            POPULATION_COLOR_MAP[200000],
            500000,
            POPULATION_COLOR_MAP[500000],
            750000,
            POPULATION_COLOR_MAP[750000],
            1000000,
            POPULATION_COLOR_MAP[1000000],
            2000000,
            POPULATION_COLOR_MAP[2000000],
        ],
        'fill-opacity': 0.75,
        'fill-outline-color': '#164E87',
    },
    'layout': {
        // Make the layer visible by default.
        'visibility': 'visible'
    },
};

const LEGEND_INFO: LegendInfo = {
    title: 'Population Served',
    bucketMap: new Map(Object.entries(POPULATION_COLOR_MAP)),
}

const POPUP_INFO: PopupInfo = {
    interactionType: InteractionType.CLICK,
}

export const populationByCountyDataLayer: DataLayer = {
    id: 'Population',
    data: '',
    legendInfo: LEGEND_INFO,
    popupInfo: POPUP_INFO,
    sourceType: 'geojson',
    styleLayer: STYLE_LAYER,
};