<template>
  <div>
    <div v-show='expandSearch' class='geocoder-content-is-expanded'>
      <GeocoderInput :acceptedTypes='this.acceptedTypes' @result='onGeocodeResults' />
      <div class='search-button'
           @click='$emit(&apos;update:expandSearch&apos;, !this.expandSearch)'>
        <img src='@/assets/icons/search.svg' />
      </div>
    </div>
    <div v-show='!expandSearch' class='geocoder-content-collapsed'>
      <div class='search-button'
           @click='$emit(&apos;update:expandSearch&apos;, !this.expandSearch)'>
        <img src='@/assets/icons/search.svg' />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, inject, PropType } from 'vue';
import GeocoderInput from './GeocoderInput.vue';
import { State } from '../model/state';
import { stateKey } from '../injection_keys';
import { GeoType } from '../model/states/model/geo_data';
import { SCORECARD_BASE } from '../router';

/**
 * Expandable address search that performs a geocode.
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
    acceptedTypes: {
      type: Array as PropType<GeoType[]>,
      // Default to all types, minus the unknown type.
      default () {
        return Object.keys(GeoType).filter((type) => type != GeoType.unknown);
      }
    },
    baseUrl: {
      type: String,
      required: true,
    },
    expandSearch: { type: Boolean, default: false },
  },
  methods: {
    async onGeocodeResults(lat: string, long: string, geoType: GeoType) {
      this.$router.push(`${this.baseUrl}/${geoType}/${lat},${long}`);
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
