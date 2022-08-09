<template>
  <div class='landing-page'>
    <LandingPageSection :messages='messages.ScorecardSearch'>
      <ScorecardSearch :messages='messages.ScorecardSearch' />
    </LandingPageSection>
    <LandingPageSection :messages='messages.MapInfo'>
      <router-link :to='mapRoute'>{{ messages.MapInfo.CTA_BUTTON }}</router-link>
    </LandingPageSection>
    <LandingPageSection :messages='messages.FilterInfo' />
    <LandingPageFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LandingPageFooter from '../components/LandingPageFooter.vue';
import ScorecardSearch from '../components/ScorecardSearch.vue';
import LandingPageSection from '../components/LandingPageSection.vue';
import * as messages from '../assets/messages/landing';
import { MAP_ROUTE_BASE } from '../router';

/**
 * This view displays a landing page with search.
 */
export default defineComponent({
  name: 'LandingPageView',
  components: {
    LandingPageFooter,
    ScorecardSearch,
    LandingPageSection,
  },
  data() {
    return {
      messages,
      mapRoute: MAP_ROUTE_BASE,
    };
  },
});
</script>

<style scoped>
.landing-page {
  background-color: #0b2553;
  min-height: 100%;
}
</style>
