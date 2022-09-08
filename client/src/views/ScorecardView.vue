<template>
  <div v-if='!showView'>

  </div>
  <div v-if='showView'>
    <PredictionPanel />
    <div class='map-container'>
      <ScorecardMapSearchBar />
      <SidePanel class='side-panel' />
      <NationwideMap class='nationwide-map' height='60vh' :scorecard='true' />
    </div>
    <div class='container-column center-container actions-to-take'
         v-if='showResultSections'>
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
    <ScorecardSummaryPanel v-if='showResultSections' />
    <ActionSection
      class='nav-to-map section'
      :header='ScorecardMessages.WANT_TO_KNOW_MORE'
      :subheader='ScorecardMessages.EXPLORE_MAP_PAGE_EXPLAINER'
      :buttonText='Titles.EXPLORE_NATION_WIDE_MAP'
      @onButtonClick='navigateToMapPage'
    />
    <LslrSection v-if='showLslrSection' :city='city' />
  </div>
</template>

<script lang='ts'>
import PredictionPanel from '../components/PredictionPanel.vue';
import ActionSection from '../components/ActionSection.vue';
import { defineComponent } from 'vue';
import { router, SCORECARD_BASE } from '../router';
import ScorecardSummaryPanel from '../components/ScorecardSummaryPanel.vue';
import { ScorecardMessages } from '../assets/messages/scorecard_messages';
import { Titles } from '../assets/messages/common';
import NationwideMap from '../components/NationwideMap.vue';
import LslrSection, { LSLR_CITY_LINKS } from '@/components/LslrSection.vue';
import { dispatch, useSelector } from '@/model/store';
import { LeadDataState } from '../model/states/lead_data_state';
import { GeoDataState } from '../model/states/geo_data_state';
import ScorecardMapSearchBar from '../components/ScorecardMapSearchBar.vue';
import SidePanel from '../components/SidePanel.vue';
import { City } from '../model/states/model/geo_data';
import { Status } from '../model/states/status_state';
import { getParcel, getWaterSystem } from '../model/slices/lead_data_slice';
import { GeoDataUtil } from '../util/geo_data_util';

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
      showResultSections: false,
      Titles,
      showView: false,
    };

  },
  computed: {
    showLslrSection(): boolean {
      return this.city != City.unknown;
    },
    city(): City {
      const intersectedCity = this.leadDataState?.data?.city
        ?? GeoDataUtil.getCityForLatLong(this.geoState?.geoids?.lat, this.geoState?.geoids?.long);
      return intersectedCity ?? City.unknown;
    },
  },
  beforeMount() {
    if (GeoDataUtil.isNullOrEmpty(this.geoState?.geoids)) {
      console.log('HERE!!!!: in beforeMount');
      this.showView = true;
      this.showResultSections = false;
      return;
    }
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
    checkLeadDataStatus() {
      const resultsDoneLoading
        = this.leadDataState?.waterSystemStatus?.status == Status.success
        && this.leadDataState?.parcelStatus?.status == Status.success;
      this.showView = resultsDoneLoading;
      this.showResultSections
        = resultsDoneLoading && !GeoDataUtil.isNullOrEmpty(this.geoState?.geoids);
    },
    updateViewWithGeoIds() {
      this.showView = false;

      // Check if an address was queried and another prediction should be
      // fetched.
      if (
        this.geoState?.geoids?.address != null
        && this.geoState?.geoids?.lat != null
        && this.geoState?.geoids?.long != null
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
    'leadDataState.data.city': function() {
      const city = this.leadDataState?.data?.city ?? City.unknown;
      this.showLslr = city != null && LSLR_CITY_LINKS.get(city) != null;
    },
    'leadDataState.waterSystemStatus': function() {
      this.checkLeadDataStatus();
    },
    'leadDataState.parcelStatus': function() {
      this.checkLeadDataStatus();
    },
    'geoState.status': function() {
      console.log('HERE!!!!: geo state status updating! ' + this.geoState?.status?.status);
      if (this.geoState?.status?.status == Status.pending) {
        this.showView = false;
      }
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

.map {
  display: flex;
  flex-direction: row;
}

.search {
  margin-right: $spacing-md;
  max-width: 350px;
  position: absolute;
  top: $spacing-sm;
  right: 0;
}

.side-panel {
  float: left;
}
</style>
