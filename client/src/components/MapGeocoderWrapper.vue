<template>
  <div>
    <div v-show='visible' class='geocoder-content-expanded'>
      <div class='geocoder' id='geocoder'></div>
      <div class='search-button' @click='this.visible = !this.visible'>
        <img src='@/assets/icons/search.svg' />
      </div>
    </div>
    <div v-show='!visible' class='geocoder-content-collapsed'>
      <div class='search-button' @click='this.visible = !this.visible'>
        <img src='@/assets/icons/search.svg' />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { computed, defineComponent, inject } from 'vue';
import { State } from '../model/state';
import { stateKey } from '../injection_keys';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import mapboxgl from 'mapbox-gl';

/**
 * Wrapper for Mapbox Geocoder.
 *
 * See details at https://github.com/mapbox/mapbox-gl-geocoder.
 */
export default defineComponent({
  name: 'MapGeocoderWrapper',
  setup(props, { emit }) {
    const visible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });
    const state: State = inject(stateKey, State.default());

    return {
      state,
      visible,
    };
  },
  data() {
    return {
      // Default to empty geocoder instance that is not connected to map or view.
      geocoder: new MapboxGeocoder(),
    };
  },
  props: {
    'modelValue': { type: Boolean, default: false },
  },
  watch: {
    'state.map': function(newMap: mapboxgl.Map) {
      // Create geocoder when map is updated and geocoder is null. This is only triggered once per
      // app load since the map is only created once.
      if (newMap != null) {
        this.geocoder = new MapboxGeocoder({
          // TODO(kailamjeter): use secrets manager for this.
          accessToken: process.env.VUE_APP_MAP_BOX_API_TOKEN,
          mapboxgl: undefined,
          marker: false,
          countries: 'US',
        });

        document.getElementById('geocoder')?.appendChild(this.geocoder.onAdd(newMap));
      }
    },
  },
});
</script>


<style>
.geocoder {
  display: inline-block;
}

.geocoder-content-collapsed {
  height: 38px;
  border-left: 1px solid #CCCCCC;
  border-right: 1px solid #CCCCCC;
}

.geocoder-content-expanded {
  height: 38px;
  border: 1px solid #CCCCCC;
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