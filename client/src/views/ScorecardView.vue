<template>
  <div>
    <PredictionPanel />
    <NationwideMap height='60vh' />
    <div class='container-column center-container actions-to-take'>
      <div class='h1-header'>
        {{ ScorecardMessages.TAKE_ACTION_HEADER }}
      </div>
      <ActionSection :header='ScorecardMessages.ADDITIONAL_STEPS_HEADER'
                     :subheader='ScorecardMessages.ADDITIONAL_STEPS_SUBHEADER'
                     :buttonText='ScorecardMessages.RESEARCH_WATER_FILTERS'
                     @onButtonClick='navigateToResourcePage' />
      <ActionSection :header='ScorecardMessages.SHARE_LEAD_OUT'
                     :buttonText='ScorecardMessages.COPY_TO_CLIPBOARD'
                     @onButtonClick='copyToClipboard' />
    </div>
    <ScorecardSummaryPanel />
    <ActionSection :header='ScorecardMessages.WANT_TO_KNOW_MORE'
                   :subheader='ScorecardMessages.EXPLORE_MAP_PAGE_EXPLAINER'
                   :buttonText='Titles.EXPLORE_NATION_WIDE_MAP'
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
      ScorecardMessages,
      Titles,
    };
  },
  methods: {
    async copyToClipboard() {
      // Requires lat,long to be in the URL.
      const urlToShare = `${process.env.VUE_APP_LEADOUT_DOMAIN}${router.currentRoute.value.fullPath}`;
      await navigator.clipboard.writeText(urlToShare);
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

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.actions-to-take {
  padding: $spacing-lg
}
</style>
