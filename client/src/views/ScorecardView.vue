<template>
  <div>
    <PredictionPanel />
    <NationwideMap height='60vh' />
    <ActionSection :header='ScorecardMessages.ADDITIONAL_STEPS_HEADER'
                   :subheader='ScorecardMessages.ADDITIONAL_STEPS_SUBHEADER'
                   :buttonText='ScorecardMessages.RESEARCH_WATER_FILTERS'
                   :bgColor='actionBackgroundColor'
                   @onButtonClick='navigateToResourcePage' />
    <ScorecardSummaryPanel />
    <ActionSection :header='ScorecardMessages.WANT_TO_KNOW_MORE'
                   :subheader='ScorecardMessages.EXPLORE_MAP_PAGE_EXPLAINER'
                   :buttonText='Titles.EXPLORE_NATION_WIDE_MAP'
                   :bgColor='actionBackgroundColor'
                   @onButtonClick='navigateToMapPage' />
  </div>
</template>

<script lang='ts'>
import PredictionPanel from '../components/PredictionPanel.vue';
import ActionSection from '../components/ActionSection.vue';
import { defineComponent } from 'vue';
import { router } from '../router';
import ScorecardSummaryPanel from '../components/ScorecardSummaryPanel.vue';
import { ScorecardMessages } from '../assets/messages/scorecard_messages';
import { Titles } from '../assets/messages/common';
import NationwideMap from '../components/NationwideMap.vue';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'ScorecardView',
  components: {
    ActionSection,
    NationwideMap,
    PredictionPanel,
    ScorecardSummaryPanel,
  },
  data() {
    return {
      actionBackgroundColor: '#E1F5FE',
      ScorecardMessages,
      Titles,
    };
  },
  methods: {
    navigateToResourcePage() {
      router.push({
        path: '/resources',
      });
    },
    navigateToMapPage() {
      router.push({
        path: '/map',
      });
    },
  },
});
</script>

<style scoped></style>
