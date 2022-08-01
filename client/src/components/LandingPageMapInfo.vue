<template>
  <div class="landing-page-map-info">
    <h1>Get up to date information about lead service lines</h1>
    <p>
      Stay informed by using the LeadOut Nationwide Map by exploring this ever-growing data set of
      lead piplines, DEP violations, demographics, and more.
    </p>
    <button>Explore Nationwide Map</button>
    <!-- TODO: Add image -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/**
 * A component for searching for a scorecard.
 */
export default defineComponent({
  name: 'LandingPageMapInfo',
});
</script>

<style scoped>
.landing-page-map-info {
  text-align: center;
  vertical-align: middle;
}
</style>
