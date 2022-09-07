<template>
  <div>
    <PredictionPanel />

    <!-- Only display the side-panel, full-width on mobile. -->
    <ScorecardMapSearchBar class='is-hidden-mobile' />
    <div class='columns is-variable is-centered'>
      <div class='column'>
        <div class='section'>
          <SidePanel />
        </div>
      </div>
      <div class='column is-two-thirds is-hidden-mobile'>
        <NationwideMap height='60vh' :scorecard='true' />
      </div>
    </div>

    <div class='section has-text-centered' v-if='showResultSections'>
      <div class='h1-header-large'>
        {{ ScorecardMessages.TAKE_ACTION_HEADER }}
      </div>
      <div class='columns is-centered'>
        <ActionSection
          class='column is-one-third'
          :header='ScorecardMessages.ADDITIONAL_STEPS_HEADER'
          :subheader='ScorecardMessages.ADDITIONAL_STEPS_SUBHEADER'
          :buttonText='ScorecardMessages.RESEARCH_WATER_FILTERS'
          @onButtonClick='navigateToResourcePage'
        />
        <ActionSection
          class='column is-one-third'
          :header='ScorecardMessages.SHARE_LEAD_OUT'
          :subheader='ScorecardMessages.SHARE_LEAD_OUT_SUBHEADER'
          :buttonText='ScorecardMessages.COPY_TO_CLIPBOARD'
          @onButtonClick='copyToClipboard'
        />
      </div>
    </div>

    <ScorecardSummaryPanel v-if='showResultSections' />

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
import LslrSection, { LSLR_CITY_LINKS } from '../components/LslrSection.vue';
import { useSelector } from '../model/store';
import { LeadDataState } from '../model/states/lead_data_state';
import { City } from '../model/states/model/geo_data';
import { GeoDataState } from '../model/states/geo_data_state';
import { GeoDataUtil } from '../util/geo_data_util';
import ScorecardMapSearchBar from '../components/ScorecardMapSearchBar.vue';
import SidePanel from '../components/SidePanel.vue';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'ScorecardView',
  components: {
    ActionSection,
    LslrSection,
    NationwideMap,
    PredictionPanel,
    ScorecardSummaryPanel,
    ScorecardMapSearchBar,
    SidePanel,
  },
  setup() {
    const geoState = useSelector((state) => state.geos) as GeoDataState;
    const leadDataState = useSelector((state) => state.leadData) as LeadDataState;

    return {
      geoState,
      leadDataState,
    };
  },
  data() {
    return {
      ScorecardMessages,
      SCORECARD_BASE,
      showLslr: false,
      showResultSections: false,
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
    'geoState.geoids': function () {
      this.showResultSections = !GeoDataUtil.isNullOrEmpty(this.geoState?.geoids);
    },
  },
});
</script>

<style scoped lang="scss">
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';
@import 'bulma/sass/layout/section.sass';
@import 'bulma/sass/grid/columns.sass';
@import 'bulma/sass/helpers/typography.sass';
@import 'bulma/sass/helpers/visibility.sass';

.nav-to-map {
  background-color: $light-blue-50;
}
</style>
