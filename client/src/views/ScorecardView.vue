<template>
  <div>
    <PredictionPanel />
    <NationwideMap height='60vh' />
    <div class='container-column center-container actions-to-take'>
      <div class='h1-header-large'>
        {{ ScorecardMessages.TAKE_ACTION_HEADER }}
      </div>
      <ActionSection
        class='section'
        :header='ScorecardMessages.ADDITIONAL_STEPS_HEADER'
        :subheader='ScorecardMessages.ADDITIONAL_STEPS_SUBHEADER'
        :buttonText='ScorecardMessages.RESEARCH_WATER_FILTERS'
        @onButtonClick='navigateToResourcePage'
      />
      <ActionSection
        class='section'
        :header='ScorecardMessages.SHARE_LEAD_OUT'
        :buttonText='ScorecardMessages.COPY_TO_CLIPBOARD'
        @onButtonClick='copyToClipboard'
      />
    </div>
    <ScorecardSummaryPanel />
    <ActionSection
      class='nav-to-map section'
      :header='ScorecardMessages.WANT_TO_KNOW_MORE'
      :subheader='ScorecardMessages.EXPLORE_MAP_PAGE_EXPLAINER'
      :buttonText='Titles.EXPLORE_NATION_WIDE_MAP'
      @onButtonClick='navigateToMapPage'
    />
    <LslrSection v-if='showLslr' :city='leadDataState?.data?.city' />
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
import LslrSection from '@/components/LslrSection.vue';
import { LSLR_CITY_LINKS } from '@/components/LslrSection.vue';
import { useSelector } from '@/model/store';
import { LeadDataState } from '../model/states/lead_data_state';
import { City } from '../model/states/model/geo_data';

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
    LslrSection,
  },
  setup() {
    const leadDataState = useSelector((state) => state.leadData) as LeadDataState;

    return {
      leadDataState,
    };
  },
  data() {
    return {
      ScorecardMessages,
      Titles,
      showLslr: false,
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
  watch: {
    'leadDataState.data.city': function() {
      const city = this.leadDataState?.data?.city ?? City.unknown;
      this.showLslr = city != null && LSLR_CITY_LINKS.get(city) != null;
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.actions-to-take {
  padding: $spacing-lg;
}

.nav-to-map {
  background-color: $light-blue-50;
}
</style>
