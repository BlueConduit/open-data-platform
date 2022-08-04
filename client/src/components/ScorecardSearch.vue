<template>
  <div class='scorecard-search'>
    <GeocoderInput @result='onGeocodeResults' />
    <!-- TODO: disable until there is a result selected -->
    <button @click='onSearch'>{{ messages.CTA_BUTTON }}</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MAP_ROUTE_BASE } from '../router';
import { Messages } from './LandingPageSection.vue';
import GeocoderInput from './GeocoderInput.vue';

/**
 * A component for searching for a scorecard.
 */
export default defineComponent({
  name: 'ScorecardSearch',
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

<style scoped></style>
