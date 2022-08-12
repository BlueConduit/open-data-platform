<template>
  <div class='geocoder'></div>
</template>

<script lang='ts'>
import { defineComponent, inject } from 'vue';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { GeoType } from '../model/states/model/geo_data';
import mapboxgl from 'mapbox-gl';
import { State } from '../model/state';
import { stateKey } from '../injection_keys';

/**
 * Wrapper for Mapbox Geocoder.
 *
 * See details at https://github.com/mapbox/mapbox-gl-geocoder.
 * And how to use the geocoder outside of a map: https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-no-map/
 */
export default defineComponent({
  name: 'GeocoderInput',
  setup() {
    // TODO: remove all dependencies on old state and delete.
    const state: State = inject(stateKey, State.default());
    return {
      state: state,
    };
  },
  data() {
    return { test: 'test' };
  },
  emits: {
    result: (lat: number, long: number, geoType: GeoType) => true,
  },
  mounted() {

  },
  watch: {
    'state.map': function(map: mapboxgl.Map | undefined) {
      console.log(`Map updated`);
      console.log(map);

      const marker = new mapboxgl.Marker({
        color: '#0b2553',
      });

      const geocoder = new MapboxGeocoder({
        // @ts-ignore
        accessToken: process.env.VUE_APP_MAP_BOX_API_TOKEN ?? '',
        mapboxgl: map,
        countries: 'US',
      });

      geocoder.addTo('.geocoder');
      geocoder.on('result', async (result: any) => {
        const place = result.result;
        if (place.place_type.length > 0) {
          const geoType = Object.values(GeoType)
            .find((geo) => geo == place.place_type[0]) as GeoType;

          const long: number = place.center[0];
          const lat: number = place.center[1];

          if (map != undefined) {
            marker.setLngLat([long, lat]).addTo(map);
          }
          
          this.$emit('result', lat, long, geoType);
        }
      });
    },
  },
});
</script>

<style>
.geocoder {
  display: inline-block;
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
