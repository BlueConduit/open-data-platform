<template>
  <div>
    <div v-show="expandSearch" class="geocoder-content-is-expanded">
      <GeocoderInput @result="onGeocodeResults" />
      <div class="search-button" @click="$emit('update:expandSearch', !this.expandSearch)">
        <img src="@/assets/icons/search.svg" />
      </div>
    </div>
    <div v-show="!expandSearch" class="geocoder-content-collapsed">
      <div class="search-button" @click="$emit('update:expandSearch', !this.expandSearch)">
        <img src="@/assets/icons/search.svg" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent, inject } from 'vue';
import GeocoderInput from './GeocoderInput.vue';
import { State } from '../model/state';
import { stateKey } from '../injection_keys';

/**
 * Wrapper for Mapbox Geocoder.
 *
 * See details at https://github.com/mapbox/mapbox-gl-geocoder.
 */
export default defineComponent({
  name: 'MapGeocoderWrapper',
  components: {
    GeocoderInput,
  },
  setup() {
    const state: State = inject(stateKey, State.default());
    return {
      state,
    };
  },
  props: {
    expandSearch: { type: Boolean, default: true },
  },
  methods: {
    async onGeocodeResults(lat: number, long: number) {
      console.log({ lat, long });
      try {
        // This gets removed in https://github.com/BlueConduit/open-data-platform/pull/77
        const data = await axios.get<any>(
          `https://ei2tz84crb.execute-api.us-east-2.amazonaws.com/dev/geolocate/${lat},${long}`,
          {
            headers: {
              Accept: 'application/json',
            },
          },
        );

        console.log(JSON.stringify(data));
      } catch (error) {
        console.log(error);
      }
    },
  },
});
</script>

<style>
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
</style>
