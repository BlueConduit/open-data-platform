<template>
  <div class="landing-page-map-info">
    <h1>{{ messages.HEADER }}</h1>
    <p>{{ messages.BODY }}</p>
    <button>{{ messages.CTA_BUTTON }}</button>
    <!-- TODO: Add image -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MapInfo } from '../assets/messages/landing';

/**
 * A component for searching for a scorecard.
 */
export default defineComponent({
  name: 'LandingPageMapInfo',
  data() {
    return {
      messages: MapInfo,
    };
  },
});
</script>

<style scoped>
.landing-page-map-info {
  text-align: center;
  vertical-align: middle;
}
</style>
