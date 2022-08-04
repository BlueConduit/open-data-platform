<template>
  <div class='landing-page-section'>
    <h2 v-if='$props.messages.SUPER_HEADER'>{{ $props.messages.SUPER_HEADER }}</h2>
    <h1>{{ messages.HEADER }}</h1>
    <p>{{ messages.BODY }}</p>
    <GeocoderInput @result='onGeocodeResults' />
    <button @click='onSearch'>{{ messages.CTA_BUTTON }}</button>
    <!-- TODO: Add image -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MAP_ROUTE_BASE } from '../router';
import GeocoderInput from './GeocoderInput.vue';

export interface Messages {
  SUPER_HEADER?: string;
  HEADER: string;
  BODY: string;
  CTA_PLACEHOLDER?: string;
  CTA_BUTTON: string;
}

/**
 * A component for searching for a scorecard.
 */
export default defineComponent({
  name: 'LandingPageSearch',
  components: { GeocoderInput },
  props: {
    messages: {
      type: Object as () => Messages,
      required: true,
    },
  },
  data() {
    return {
      lat: 0,
      long: 0,
    };
  },
  methods: {
    onGeocodeResults(lat: number, long: number) {
      this.lat = lat;
      this.long = long;
    },
    onSearch() {
      window.location.replace(`${MAP_ROUTE_BASE}/${this.lat},${this.long}`);
    },
  },
});
</script>

<style scoped>
.landing-page-section {
  margin: 0;
  padding: 50px;
  background-color: #fff;
  text-align: center;
  vertical-align: middle;
}
</style>
