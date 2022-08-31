<template>
  <div>
    <PredictionPanel />
    <div class='map-container'>
      <MapGeocoderWrapper
        class='search'
        :acceptedTypes='acceptedTypes'
        :baseUrl='SCORECARD_BASE'
        v-model:expandSearch='showSearch'
      />
      <NationwideMap height='60vh' :static='true' />
    </div>
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

<script lang="ts">
import PredictionPanel from '../components/PredictionPanel.vue';
import ActionSection from '../components/ActionSection.vue';
import { defineComponent } from 'vue';
import { router, SCORECARD_BASE } from '../router';
import ScorecardSummaryPanel from '../components/ScorecardSummaryPanel.vue';
import { ScorecardMessages } from '../assets/messages/scorecard_messages';
import { Titles } from '../assets/messages/common';
import NationwideMap from '../components/NationwideMap.vue';
import LslrSection, { LSLR_CITY_LINKS } from '@/components/LslrSection.vue';
import { useSelector } from '@/model/store';
import { LeadDataState } from '../model/states/lead_data_state';
import { City, GeoType } from '../model/states/model/geo_data';
import MapGeocoderWrapper from '../components/MapGeocoderWrapper.vue';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'ScorecardView',
  components: {
    ActionSection,
    LslrSection,
    MapGeocoderWrapper,
    NationwideMap,
    PredictionPanel,
    ScorecardSummaryPanel,
  },
  setup() {
    const leadDataState = useSelector((state) => state.leadData) as LeadDataState;

    return {
      leadDataState,
    };
  },
  data() {
    return {
      acceptedTypes: [GeoType.address, GeoType.postcode],
      showSearch: true,
      ScorecardMessages,
      SCORECARD_BASE,
      showLslr: false,
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
  watch: {
    'leadDataState.data.city': function () {
      const city = this.leadDataState?.data?.city ?? City.unknown;
      this.showLslr = city != null && LSLR_CITY_LINKS.get(city) != null;
    },
  },
});
</script>

<style scoped lang="scss">
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.actions-to-take {
  padding: $spacing-lg;
}

.nav-to-map {
  background-color: $light-blue-50;
}

.map-container {
  position: relative;
}

.search {
  margin-right: $spacing-md;
  max-width: 350px;
  position: absolute;
  top: $spacing-sm;
  right: 0;
}
</style>
