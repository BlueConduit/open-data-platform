<template>
  <div class="geocoder"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

/**
 * Wrapper for Mapbox Geocoder.
 *
 * See details at https://github.com/mapbox/mapbox-gl-geocoder.
 * More details on how to use the geocoder outside of a map: https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-no-map/
 */
export default defineComponent({
  name: 'GeocoderInput',
  data() {
    const geocoder = new MapboxGeocoder({
      accessToken: process.env.VUE_APP_MAP_BOX_API_TOKEN ?? '',
      mapboxgl: undefined,
      marker: false,
      countries: 'US',
    });
    return {
      geocoder,
    };
  },
  mounted() {
    this.geocoder.addTo('.geocoder');

    // TODO: replace 'any' here with a meaningful type.
    this.geocoder.on('result', async (result: any) => {
      const long = result.result.center[0];
      const lat = result.result.center[1];
      console.log({ lat, long });
    });
  },
});
</script>

<style>
.geocoder {
  display: inline-block;
}

.geocoder-content-collapsed {
  height: 38px;
  border-left: 1px solid #cccccc;
  border-right: 1px solid #cccccc;
}

.geocoder-content-is-expanded {
  height: 38px;
  border: 1px solid #cccccc;
  border-radius: 5px;
}

.search-button {
  float: right;
  display: inline-block;
  padding: 10px 15px 0 15px;
}

/** Override geocoder styles. **/

.mapboxgl-ctrl-geocoder {
  box-shadow: none;
}

.mapboxgl-ctrl-geocoder--icon-search {
  visibility: hidden;
  width: 0;
  height: 0;
}

.mapboxgl-ctrl-geocoder--input {
  padding: 10px 11px;
  line-height: 12px;
}

.mapboxgl-ctrl-geocoder--input:focus {
  outline: none;
}
</style>
