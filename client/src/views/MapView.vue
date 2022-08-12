<template>
  <div>
    <SearchBar v-if='showSearch' />
    <PredictionPanel v-if='showResult' />
    <MapContainer />
    <ActionSection v-if='showResult'
                   :header='ScorecardMessages.ADDITIONAL_STEPS_HEADER'
                   :subheader='ScorecardMessages.ADDITIONAL_STEPS_SUBHEADER'
                   :buttonText='Titles.EXPLORE_NATION_WIDE_MAP'
                   @onButtonClick='navigateToResourcePage' />
    <ScorecardSummaryPanel v-if='showResult' />
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
  },
});
</script>

<style scoped></style>
