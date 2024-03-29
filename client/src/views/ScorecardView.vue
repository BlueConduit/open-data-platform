<template>
  <div>
    <!-- Cover the entire page with loading element until data is ready. -->
    <div class='loading' v-if='!showScorecard'>
      <loading :active='true'
               :is-full-page='false'
               color='#2553A0'
               loader='bars'
               :opacity='1' />
    </div>
    <div v-if='showScorecard'>
      <PredictionPanel />

      <!-- Only display the side-panel, full-width on mobile. -->
      <ScorecardMapViewBar />
      <div
        class='columns is-variable is-centered is-hidden-mobile map-container-div'>
        <div class='column is-hidden-touch side-panel' v-if='showResults'>
          <div class='section'>
            <SidePanel />
          </div>
        </div>
        <div class='column'>
          <NationwideMap height='70vh' :enableBasicMap='true' />
        </div>
      </div>
      <ScorecardSummaryPanel v-if='showResults' />
      <div class='section has-text-centered' v-if='showResults'>
        <div class='h1-header-large'>
          {{ ScorecardMessages.TAKE_ACTION_HEADER }}
        </div>
        <div class='columns is-centered'>
          <ActionSection
            class='column is-full-mobile is-half-tablet is-one-quarter-desktop '
            :header='ScorecardMessages.ADDITIONAL_STEPS_HEADER'
            :subheader='ScorecardMessages.ADDITIONAL_STEPS_SUBHEADER'
            :buttonText='ScorecardMessages.RESEARCH_WATER_FILTERS'
            image='protect-home.png'
            :imagePosition='ImagePosition.background'
            @onButtonClick='navigateToWaterFiltersPage' />
          <ActionSection
            class='column is-full-mobile is-half-tablet is-one-quarter-desktop'
            :header='ScorecardMessages.SHARE_LEAD_OUT'
            :subheader='ScorecardMessages.SHARE_LEAD_OUT_SUBHEADER'
            buttonIcon='copy.png'
            :buttonText='ScorecardMessages.COPY_TO_CLIPBOARD'
            :buttonTooltip='ScorecardMessages.COPIED_TO_CLIPBOARD'
            image='share-lead-out.png'
            :imagePosition='ImagePosition.background'
            @onButtonClick='copyToClipboard' />
        </div>
      </div>
      <ContactCitySection class='section' v-if='showLslrSection' :city='city' />
      <div class='is-flex what-to-do'>
        <div class='section'>
          <div class='h1-header-large'>
            {{ ScorecardMessages.WHAT_TO_DO_HEADER }}
          </div>
          <ActionSection
            :subheader='ScorecardMessages.WHAT_TO_SUBHEADER'
            :buttonText='Titles.BLOG'
            @onButtonClick='navigateToBlog' />
        </div>
        <img class='is-hidden-mobile'
             :src='require(`@/assets/media/what-now.png`)'
             alt='' />
      </div>
      <div class='section has-text-centered nav-to-map'>
        <div class='h1-header-large'>
          {{ ScorecardMessages.WANT_TO_KNOW_MORE }}
        </div>
        <ActionSection
          :header='ScorecardMessages.EXPLORE_MAP_PAGE_EXPLAINER'
          :buttonText='Titles.EXPLORE_NATION_WIDE_MAP'
          image='map-preview.png'
          @onButtonClick='navigateToMapPage' />
      </div>
      <LslrSection v-if='showLslrSection' :city='city' />
      <EmailSignup v-if='missingParcelData' />
    </div>
  </div>
</template>

<script lang='ts'>
import PredictionPanel from '../components/scorecard_page/PredictionPanel.vue';
import ActionSection from '../components/scorecard_page/ActionSection.vue';
import { defineComponent } from 'vue';
import { router, SCORECARD_BASE } from '../router';
import ScorecardSummaryPanel from '../components/scorecard_page/ScorecardSummaryPanel.vue';
import { ScorecardMessages } from '../assets/messages/scorecard_messages';
import { Titles } from '../assets/messages/common';
import NationwideMap from '../components/NationwideMap.vue';
import LslrSection from '../components/scorecard_page/LslrSection.vue';
import { dispatch, useSelector } from '../model/store';
import { LeadDataState } from '../model/states/lead_data_state';
import { GeoDataState } from '../model/states/geo_data_state';
import ScorecardMapViewBar from '../components/scorecard_page/ScorecardMapViewBar.vue';
import SidePanel from '../components/scorecard_page/ScorecardSidePanel.vue';
import { City } from '../model/states/model/geo_data';
import { Status } from '../model/states/status_state';
import { getParcel, getWaterSystem } from '../model/slices/lead_data_slice';
import { GeoDataUtil } from '../util/geo_data_util';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import ContactCitySection from '../components/scorecard_page/ContactCitySection.vue';
import EmailSignup from '../components/EmailSignup.vue';
import { ImagePosition } from '../components/enums/enums';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'ScorecardView',
  components: {
    ActionSection,
    ContactCitySection,
    EmailSignup,
    Loading,
    LslrSection,
    NationwideMap,
    PredictionPanel,
    ScorecardSummaryPanel,
    ScorecardMapViewBar,
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
      SCORECARD_BASE,
      showResultSections: false,
      ScorecardMessages,
      Titles,
      ImagePosition,
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
    missingParcelData(): boolean {
      return this.leadDataState?.data?.publicLeadLowPrediction == null &&
        this.leadDataState?.data?.publicLeadHighPrediction == null;
    },
  },
  methods: {
    async copyToClipboard() {
      // Requires lat,long to be in the URL.
      await navigator.clipboard.writeText(window.location.href);
    },
    navigateToWaterFiltersPage() {
      router.push({
        path: '/select-water-filter',
      });
    },
    navigateToMapPage() {
      router.push({
        path: '/map',
      });
    },
    navigateToBlog() {
      router.push({
        path: '/blog',
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
    'geoState.geoids': function() {
      this.updateViewWithGeoIds();
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';
@import 'bulma/sass/utilities/mixins';

.nav-to-map {
  background-color: $light-blue-50;
}

.columns.map-container-div {
  margin-bottom: 0;

  .column {
    padding-bottom: 0;
  }
}

.side-panel {
  max-width: 6 * $spacing-xl;
}

.what-to-do {
  background-color: $light-gold;

  // Below tablet, center text
  @include touch {
    text-align: center;
  }

  // Above tablet create padding
  @include tablet {
    .section {
      padding-right: $spacing-lg * 6;
    }
  }

  // Above tablet create padding
  @include desktop {
    .section {
      padding-right: $spacing-lg * 10;
    }
  }

  img {
    max-width: 400px;
  }
}
</style>