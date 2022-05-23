<template>
  <div id="map-container"></div>
  <MapLegend
      :title="this.legendTitle"
      :bucketMap="this.bucketMap"/>
</template>

<script lang="ts">
import mapboxgl from 'mapbox-gl';
import mapbox, {GeoJSONSourceRaw, LngLatLike, MapLayerMouseEvent} from 'mapbox-gl';
import axios from 'axios'
import MapLegend from '@/components/MapLegend.vue';
import MapPopupContent from '@/components/MapPopupContent.vue';
import {createApp, defineComponent, nextTick, PropType} from 'vue'

const DEFAULT_LNG_LAT = [-98.5556199, 39.8097343];

const OPEN_DATA_PLATFORM_API_URL = 'https://v2rz6wzmb7.execute-api.us-east-2.amazonaws.com/default';
const POPUP_CONTENT_BASE_ID = 'popup-content';
const POPUP_CONTENT_BASE_HTML = `<div id="${POPUP_CONTENT_BASE_ID}"></div>`;

// TODO(kaila): figure out useful buckets.
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
          '#1A237E'
    };

export default defineComponent({
  name: "MapView",
  components: {
    MapLegend,
  },
  setup() {
    // TODO: Hide access tokens. For now, this is MapBox's public API token.
    mapbox.accessToken = process.env.VUE_APP_MAP_BOX_API_TOKEN
  },
  data() {
    return {
      map: {} as mapboxgl.Map,
      legendTitle: '',
      bucketMap: new Map<string, string>(),
    }
  },
  props: {
    /**
     * Where to load the initial map. Defaults to center of continental US.
     */
    center: {
      // There is no constructor function for a Tuple, so use object here and
      // cast to PropType of a tuple.
      // See https://vuejs.org/guide/typescript/options-api.html#typing-component-props.
      type: Object as PropType<[number, number]>,
      default: DEFAULT_LNG_LAT,
    }
  },
  methods: {
    /**
     * Creates popup component at the given lngLat.
     *
     * Passes propsData to the MapPopupContent component which is nested in the
     * popup.
     */
    createMapPopup(lngLat: LngLatLike, popupData: Record<string, any>): void {
      new mapbox.Popup(
          {className: 'mapbox-popup'})
          .setLngLat(lngLat)
          .setHTML(POPUP_CONTENT_BASE_HTML) // Add basic div to mount to.
          .addTo(this.map);

      // Creates component which extends MapPopupContent and mounts it onto the
      // div passed to the Popup.
      const MapPopup = defineComponent({
        extends: MapPopupContent,
      })
      nextTick(() => {
        createApp(MapPopup, popupData).mount(`#${POPUP_CONTENT_BASE_ID}`)
      });
    },

    /**
     * Sets up interaction handlers for map.
     */
    setUpInteractionHandlers(): void {
      // Use MapBox's custom click handler, which takes the style layer that we
      // want to set up a handler for as a parameter.
      this.map.on('click', 'epa-violations-population-style',
          async (e: MapLayerMouseEvent) => {
            if (e.features != undefined) {
              const clickedFeatureProperties: { [name: string]: any; }
                  = e.features[0].properties as {};

              this.createMapPopup(
                  e.lngLat,
                  /* popupData= */
                  {
                    properties: new Map(Object.entries(clickedFeatureProperties)),
                  });
            }
          });
    },

    /**
     * Creates base Mapbox map and configures interactions and styles for
     * layers.
     *
     * @param leadRuleViolationData initial data to display.
     */
    async createMap(leadRuleViolationData: string): Promise<void> {
      try {
        this.map = new mapbox.Map({
          // Removes watermark by Mapbox.
          attributionControl: false,
          center: this.center,
          container: "map-container",
          style: "mapbox://styles/mapbox/streets-v11",
          zoom: 4,
        });

        this.map.on('load', () => {
          const geoJSONSource: GeoJSONSourceRaw = {
            type: 'geojson',
            data: leadRuleViolationData
          };
          this.map.addSource('epa-violations', geoJSONSource);

          // Add style layer for water system boundary data. Without this layer
          // water boundary data will not appear.
          this.map.addLayer({
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
          });

          // Initial values for legend based on visible layer.
          this.legendTitle = 'Population Served';
          this.bucketMap = new Map(Object.entries(POPULATION_COLOR_MAP));

          this.setUpInteractionHandlers();
        });
      } catch (err) {
        // TODO: Add error handling.
        console.log("Error: ", err);
      }
    },
  },
  mounted() {
    // Fetch initial map data from API.
    // TODO(kailajeter): Create initial load method to load in all data sources.
    axios
        .get(`${OPEN_DATA_PLATFORM_API_URL}/getViolations`)
        .then(response => this.createMap(response.data.toString()));
  }
})
</script>

<style>
#map-container {
  height: 100vh;
}

/** Override Mapbox Popup styles. */

.mapboxgl-popup-content {
  border-radius: 8px;
  width: 258px;
  height: 256px;
  padding: 18px;
}

.mapboxgl-popup-tip {
  visibility: hidden;
}
</style>