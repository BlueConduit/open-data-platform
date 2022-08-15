<template>
  <div class='landing-page'>
    <div class='search-section'>
      <LandingPageSection class='search-landing-page-section'
                          :messages='messages.ScorecardSearch'
                          text-color='#FFFFFF'>
        <ScorecardSearch :messages='messages.ScorecardSearch' />
      </LandingPageSection>
    </div>
    <LandingPageSection :messages='messages.MapInfo'>
      <router-link :to='mapRoute'>{{ messages.MapInfo.CTA_BUTTON }}
      </router-link>
    </LandingPageSection>
    <LandingPageSection :messages='messages.FilterInfo' />
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
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

.search-section {
  background-image: url('~@/assets/media/landing-image-1.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 766.74px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.search-landing-page-section {
  background: none;
  width: 974px;
  height: 358px;
}
</style>
