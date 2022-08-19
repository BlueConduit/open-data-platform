<template>
  <div>
    <PredictionPanel />
    <NationwideMap height='60vh' />
    <div class='container-column center-container actions-to-take'>
      <div class='h1-header semi-bold'>
        {{ ScorecardMessages.TAKE_ACTION_HEADER }}
      </div>
      <ActionSection
        :header='ScorecardMessages.ADDITIONAL_STEPS_HEADER'
        :subheader='ScorecardMessages.ADDITIONAL_STEPS_SUBHEADER'
        :buttonText='ScorecardMessages.RESEARCH_WATER_FILTERS'
        :style='style'
        @onButtonClick='navigateToResourcePage'
      />
      <ActionSection
        :header='ScorecardMessages.SHARE_LEAD_OUT'
        :buttonText='ScorecardMessages.COPY_TO_CLIPBOARD'
        :style='style'
        @onButtonClick='copyToClipboard'
      />
    </div>
    <ScorecardSummaryPanel />
    <ActionSection
      :header='ScorecardMessages.WANT_TO_KNOW_MORE'
      :subheader='ScorecardMessages.EXPLORE_MAP_PAGE_EXPLAINER'
      :buttonText='Titles.EXPLORE_NATION_WIDE_MAP'
      @onButtonClick='navigateToMapPage'
    />
  </div>
</template>

<script lang="ts">
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
      style: { color: '#464646' },
      ScorecardMessages,
      Titles,
    };
  },
  methods: {
    async copyToClipboard() {
      // Requires lat,long to be in the URL.
      await navigator.clipboard.writeText(window.location.href);
    },
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

<style scoped>
.actions-to-take {
  background-color: #e1f5fe;
  padding: 20px;
}
</style>
