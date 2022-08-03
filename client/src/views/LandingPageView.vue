<template>
  <div class='landing-page'>
    <LandingPageSection :messages='messages.ScorecardSearch' />
    <LandingPageSection :messages='messages.MapInfo' />
    <LandingPageSection :messages='messages.FilterInfo' />
    <LandingPageFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LandingPageFooter from '../components/LandingPageFooter.vue';
import LandingPageSection from '../components/LandingPageSection.vue';
import { ScorecardSearch, FilterInfo, MapInfo } from '../assets/messages/landing';

/**
 * This view displays a landing page with search.
 */
export default defineComponent({
  name: 'LandingPageView',
  components: {
    LandingPageFooter,
    LandingPageSection,
  },
  data() {
    return {
      messages: { ScorecardSearch, MapInfo, FilterInfo },
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
