<template>
  <div class='landing-page'>
    <div class='search-section'>
      <LandingPageSection class='search-landing-page-section'
                          :messages='messages.ScorecardSearch'
                          text-color='#FFFFFF'>
        <ScorecardSearch :messages='messages.ScorecardSearch' />
      </LandingPageSection>
    </div>
    <LandingPageSection :messages='messages.MapInfo'
                        text-color='#464646'
                        header-size='40px'>
      <img class='static-map' :src='require(`@/assets/media/static-map.png`)'
           alt=''>
      <button class='explore-map-button' @click='exploreMap'>
        {{ messages.MapInfo.CTA_BUTTON }}
      </button>
    </LandingPageSection>
    <LandingPageSection :messages='messages.FilterInfo'
                        background-color='#05A8F4' text-color='#FFFFFF'>
      <button class='learn-more-button' @click='exploreMap'>
        {{ messages.FilterInfo.CTA_BUTTON }}
      </button>
    </LandingPageSection>
    <LandingPageFooter />
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import ScorecardSearch from '../components/ScorecardSearch.vue';
import LandingPageSection from '../components/LandingPageSection.vue';
import * as messages from '../assets/messages/landing';
import { MAP_ROUTE_BASE, router } from '../router';

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
  methods: {
    exploreMap(): void {
      router.push({
        path: '/map',
      });
    },
  },
});
</script>

<style scoped>
.explore-map-button {
  width: 190px;
  height: 65px;
  padding: 0 19px;
  border-radius: 16px;
  background-color: #FFC300;
  border: 0px;
  font-size: 18px;
}

.landing-page {
  background-color: #0b2553;
  min-height: 100%;
}

.learn-more-button {
  width: fit-content;
  font-size: 18px;
  font-weight: 500;
  line-height: 65px;
  text-align: center;
  color: #464646;
  border-radius: 16px;
  border: 1px solid #A3A3A3;
  padding: 0 19px;
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

.static-map {
  width: 920.5px;
  height: 467.5px;
  border-radius: 15px;

  /* Warm Grey/LO_Warm Grey 50 */
  background: #FBFBFB;
  /* button-elevation/default/small/normal */
  box-shadow: 0px 1px 32px rgba(0, 0, 0, 0.08), 0px 12px 16px rgba(0, 0, 0, 0.12), 0px 8px 12px -6px rgba(0, 0, 0, 0.16);
  border-radius: 15px;
}
</style>
