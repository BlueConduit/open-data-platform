<template>
  <div id="map-container"></div>
</template>

<script>
import mapbox from "mapbox-gl";

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
        return [-98.5556199, 39.8097343];
      }
    }
  },
  methods: {
    async createMap() {
      try {
        this.map = new mapbox.Map({
          // Removes watermark by Mapbox.
          attributionControl: false,
          center: this.center,
          container: "map-container",
          style: "mapbox://styles/mapbox/streets-v11",
          zoom: 4,
        });

      } catch (err) {
        // TODO: Add error handling.
        console.log("Error: ", err);
      }
    },
  },
  mounted() {
    this.createMap()
  }
}
</script>

<style scoped>
  #map-container {
    height: 100vh;
  }
</style>