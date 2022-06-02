<template>
  <div v-show='visible' class='geocoder-content-expanded'>
    <div class='geocoder' id='geocoder'></div>
    <div class='search-button' @click='toggleVisibility()'>
      <img src="@/assets/icons/search.svg" />
    </div>
  </div>
  <div v-show='!visible' class='geocoder-content-collapsed'>
    <div class='search-button' @click='toggleVisibility()'>
      <img src="@/assets/icons/search.svg" />
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, inject } from 'vue';
import { State } from '../model/state';
import { stateKey } from '../injection_keys';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import mapboxgl from 'mapbox-gl';

export default defineComponent({
  name: 'MapGeocoderWrapper',
  setup() {
    const state: State = inject(stateKey, State.default());

    return {
      state,
    };
  },
  data() {
    return {
      geocoder: null as unknown as MapboxGeocoder,
      visible: false,
    }
  },
  methods: {
    toggleVisibility() {
      this.visible = !this.visible;
      console.log(this.visible);
    }
  },
  watch: {
    'state.map': function(newMap: mapboxgl.Map) {
      if (newMap != null && this.geocoder == null) {
        this.geocoder = new MapboxGeocoder({
          accessToken: process.env.VUE_APP_MAP_BOX_API_TOKEN,
          mapboxgl: mapboxgl as unknown as mapboxgl.Map,
          marker: true,
        });

        document.getElementById('geocoder')?.appendChild(this.geocoder.onAdd(newMap));
      }
    }
  }
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

.mapboxgl-ctrl-geocoder--input:focus {
  outline: none;
}

.mapboxgl-ctrl-geocoder--input {
  padding: 10px 11px;
  line-height: 12px;
}

.geocoder-content-expanded {
  height: 38px;
  border: 1px solid #CCCCCC;
  border-radius: 5px;
}

.mapboxgl-ctrl-geocoder--icon-search {
  visibility: hidden;
  width: 0;
  height: 0;
}

.mapboxgl-ctrl-geocoder {
  box-shadow: none;
}

.search-button {
  float: right;
  display: inline-block;
  padding: 10px 15px 0 15px;
}
</style>