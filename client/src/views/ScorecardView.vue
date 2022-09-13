<template>
  <div>
    <!-- Cover the entire page with loading element until data is ready. -->
    <div class='loading' v-if='!showScorecard'>
      <loading :active='true' :is-full-page='false' color='#2553A0' loader='bars' opacity='1' />
    </div>
    <div v-if='showScorecard'>
      <PredictionPanel />

      <!-- Only display the side-panel, full-width on mobile. -->
      <ScorecardMapSearchBar class='is-hidden-mobile' />
      <div class='columns is-variable is-centered is-gapless'>
        <div class='column side-panel' v-if='showResults'>
          <div class='section'>
            <SidePanel />
          </div>
        </div>
        <div class='column is-hidden-mobile'>
          <NationwideMap height='60vh' :enableBasicMap='true' />
        </div>
      </div>

      <div class='section has-text-centered' v-if='showResults'>
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

      <ContactCitySection class='section' v-if='showLslrSection' :city='city' />

      <ScorecardSummaryPanel v-if='showResults' />

      <ActionSection
        class='nav-to-map section'
        :header='ScorecardMessages.WANT_TO_KNOW_MORE'
        :subheader='ScorecardMessages.EXPLORE_MAP_PAGE_EXPLAINER'
        :buttonText='Titles.EXPLORE_NATION_WIDE_MAP'
        @onButtonClick='navigateToMapPage'
      />

      <LslrSection v-if='showLslrSection' :city='city' />
    </div>
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
import LslrSection from '../components/LslrSection.vue';
import { dispatch, useSelector } from '../model/store';
import { LeadDataState } from '../model/states/lead_data_state';
import { GeoDataState } from '../model/states/geo_data_state';
import ScorecardMapSearchBar from '../components/ScorecardMapSearchBar.vue';
import SidePanel from '../components/SidePanel.vue';
import { City } from '../model/states/model/geo_data';
import { Status } from '../model/states/status_state';
import { getParcel, getWaterSystem } from '../model/slices/lead_data_slice';
import { GeoDataUtil } from '../util/geo_data_util';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import ContactCitySection from '../components/ContactCitySection.vue';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'ScorecardView',
  components: {
    ContactCitySection,
    ActionSection,
    Loading,
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
      showResultSections: false,
      Titles,
    };
  },
  computed: {
    showLslrSection(): boolean {
      return this.city != City.unknown;
    },
    city(): City {
      const intersectedCity =
        this.leadDataState?.data?.city ??
        GeoDataUtil.getCityForLatLong(this.geoState?.geoids?.lat, this.geoState?.geoids?.long);
      return intersectedCity ?? City.unknown;
    },
    leadDataLoaded(): boolean {
      return (
        this.leadDataState?.waterSystemStatus?.status == Status.success &&
        this.leadDataState?.parcelStatus?.status == Status.success
      );
    },
    showScorecard(): boolean {
      return (
        GeoDataUtil.isNullOrEmpty(this.geoState?.geoids) ||
        (this.geoState?.status?.status != Status.pending && this.leadDataLoaded)
      );
    },
    showResults(): boolean {
      return !GeoDataUtil.isNullOrEmpty(this.geoState?.geoids);
    },
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
    updateViewWithGeoIds() {
      // Check if an address was queried and another prediction should be
      // fetched.
      if (
        this.geoState?.geoids?.address != null &&
        this.geoState?.geoids?.lat != null &&
        this.geoState?.geoids?.long != null
      ) {
        dispatch(getParcel(this.geoState.geoids.lat, this.geoState.geoids.long));
      }
      // Request water system data if PWSID is not null, even for address search.
      if (this.geoState?.geoids?.pwsId != null) {
        dispatch(getWaterSystem(this.geoState.geoids.pwsId.id));
      }
    },
  },
  watch: {
    // Listen for changes to pws id or lat, long. Once it changes, a new
    // prediction must be fetched.
    'geoState.geoids': function () {
      this.updateViewWithGeoIds();
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

.side-panel {
  max-width: 6 * $spacing-xl;
}
</style>
