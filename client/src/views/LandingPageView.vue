<template>
  <LandingPageSection :messages="messages.ScorecardSearch" />
  <LandingPageSection :messages="messages.MapInfo" />
  <LandingPageSection :messages="messages.FilterInfo" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LandingPageSection from '@/components/LandingPageSection.vue';
import { ScorecardSearch, FilterInfo, MapInfo } from '../assets/messages/landing';

/**
 * This view displays a landing page with search.
 */
export default defineComponent({
  name: 'LandingPageView',
  components: {
    LandingPageSection,
  },
  data() {
    return {
      messages: { ScorecardSearch, MapInfo, FilterInfo },
    };
  },
});
</script>

<style scoped></style>
