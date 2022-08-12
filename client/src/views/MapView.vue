<template>
  <div>
    <SearchBar v-if='showSearch' />
    <PredictionPanel v-if='showResult' />
    <MapContainer />
    <ActionSection v-if='showResult'
                   :header='ScorecardMessages.ADDITIONAL_STEPS_HEADER'
                   :subheader='ScorecardMessages.ADDITIONAL_STEPS_SUBHEADER'
                   :buttonText='ScorecardMessages.RESEARCH_WATER_FILTERS'
                   bgColor='#E1F5FE'
                   @onButtonClick='navigateToResourcePage' />
    <ScorecardSummaryPanel v-if='showResult' />
    <ActionSection v-if='showResult'
                   :header='ScorecardMessages.WANT_TO_KNOW_MORE'
                   :subheader='ScorecardMessages.EXPLORE_MAP_PAGE_EXPLAINER'
                   :buttonText='Titles.EXPLORE_NATION_WIDE_MAP'
                   bgColor='#E1F5FE'
                   @onButtonClick='navigateToMapPage' />
  </div>
</template>

<script lang='ts'>
import MapContainer from '../components/MapContainer.vue';
import PredictionPanel from '../components/PredictionPanel.vue';
import SearchBar from '../components/SearchBar.vue';
import ActionSection from '../components/ActionSection.vue';
import { defineComponent } from 'vue';
import { router, SCORECARD_BASE, MAP_ROUTE_BASE } from '../router';
import ScorecardSummaryPanel from '../components/ScorecardSummaryPanel.vue';
import { ScorecardMessages } from '../assets/messages/scorecard_messages';
import { Titles } from '../assets/messages/common';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'MapView',
  components: {
    ActionSection,
    MapContainer,
    PredictionPanel,
    SearchBar,
    ScorecardSummaryPanel,
  },
  data() {
    return {
      showSearch: router.currentRoute.value.path.startsWith(MAP_ROUTE_BASE),
      showResult: router.currentRoute.value.path.startsWith(SCORECARD_BASE),
      ScorecardMessages,
      Titles,
    };
  },
  methods: {
    navigateToResourcePage() {
      console.log('navigate to resources');
      router.push({
        path: '/resources',
      });
    },
    navigateToMapPage() {
      console.log('navigate to map');
      router.push({
        path: '/map',
      });
    },
  },
});
</script>

<style scoped></style>
