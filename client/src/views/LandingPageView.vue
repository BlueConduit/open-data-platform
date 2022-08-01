<template>
  <LandingPageScorecardSearch />
  <LandingPageMapInfo />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LandingPageMapInfo from '@/components/LandingPageMapInfo.vue';
import LandingPageScorecardSearch from '@/components/LandingPageScorecardSearch.vue';

/**
 * This view displays a landing page with search.
 */
export default defineComponent({
  name: 'LandingPageView',
  components: {
    LandingPageMapInfo,
    LandingPageScorecardSearch,
  },
});
</script>

<style scoped></style>
