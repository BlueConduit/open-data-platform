<template>
  <div id="map-container"></div>
</template>

<script>
import mapbox from 'mapbox-gl';
import axios from 'axios'

const DEFAULT_LATITUDE = 39.8097343;
const DEFAULT_LONGITUDE = -98.5556199;

const OPEN_DATA_PLATFORM_API_URL = 'https://v2rz6wzmb7.execute-api.us-east-2.amazonaws.com/default';

export default {
  name: "MapView",
  setup() {
    // TODO: Hide access tokens. For now, this is MapBox's public API token.
    mapbox.accessToken = process.env.VUE_APP_MAP_BOX_API_TOKEN
  },
  data() {
    return {
      map: {}
    }
  },
  props: {
    /**
     * Where to load the initial map. Defaults to center of continental US.
     */
    center: {
      type: Array,
      default: function () {
        return [DEFAULT_LONGITUDE, DEFAULT_LATITUDE];
      }
    }
  },
  methods: {
    async createMap(waterBoundaryData) {
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
          this.map.addSource('water-boundaries', {
            type: 'geojson',
            data: waterBoundaryData
          });

          // Add style layer for water system boundary data. Without this layer
          // water boundary data will not appear.
          this.map.addLayer({
            'id': 'water-boundaries-style',
            'source': 'water-boundaries',
            'type': 'line',
            'layout': {
              // Make the layer visible by default.
              'visibility': 'visible'
            },
          });
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
        .get(`${OPEN_DATA_PLATFORM_API_URL}/getWaterSystems`)
        .then(response => this.createMap(response.data.toString()));
  }
}
</script>

<style scoped>
  #map-container {
    height: 100vh;
  }
</style>