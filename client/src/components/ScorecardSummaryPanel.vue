<template>
  <div class='container-wrapper'>
    <div class='container-column'>
      <div class='semi-bold h1-header'>
        <div> {{ ScorecardSummaryMessages.SCORECARD_SUMMARY_PANEL_HEADER }}
        </div>
      </div>
      <div> {{ ScorecardSummaryMessages.SCORECARD_SUMMARY_PANEL_SUBHEADER }}
      </div>
      <div class='container-column'>
        <ScorecardSummaryRow :header='ScorecardSummaryMessages.HOME_AGE'
                             :subheader='ScorecardSummaryMessages.HOME_AGE_EXPLAINED'
                             :comparisonValue='homeAgeComparison' />
        <ScorecardSummaryRow
          :header='ScorecardSummaryMessages.SOCIAL_VULNERABILITY_INDEX'
          :subheader='ScorecardSummaryMessages.SOCIAL_VULNERABILITY_INDEX_EXPLAINED'
          :image-float-direction='ImageFloatDirection.right'
          :comparisonValue='socialVulnerabilityComparison' />
        <ScorecardSummaryRow :header='ScorecardSummaryMessages.INCOME_LEVEL'
                             :subheader='ScorecardSummaryMessages.INCOME_LEVEL_EXPLAINED'
                             :comparisonValue='incomeComparison' />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ScorecardSummaryMessages } from '../assets/messages/scorecard_summary_messages';
import ScorecardSummaryRow, { ImageFloatDirection } from './ScorecardSummaryRow.vue';
import { dispatch, useSelector } from '../model/store';
import { GeoState } from '../model/states/geo_state';
import { getDemographicData } from '../model/slices/demographic_data_slice';
import { DemographicDataState } from '../model/states/demographic_data_state';
import { GeographicLevel } from '../model/data_layer';

/**
 * Prediction explanation.
 */
export default defineComponent({
  name: 'ScorecardSummaryPanel',
  components: {
    ScorecardSummaryRow,
  },
  setup() {
    // Listen to state updates.
    const geoState = useSelector((state) => state.geos) as GeoState;
    const demographicData = useSelector((state) => state.demographicData) as DemographicDataState;

    return {
      geoState: geoState,
      demographicDataState: demographicData,
    };
  },
  data() {
    return {
      ScorecardSummaryMessages,
      ImageFloatDirection,
    };
  },
  computed: {
    homeAgeComparison(): string | null {
      return this.formatNumber(this.demographicDataState?.data?.averageHomeAge);
    },
    incomeComparison(): string | null {
      return this.formatNumber(this.demographicDataState?.data?.averageIncome);
    },
    socialVulnerabilityComparison(): string | null {
      return this.formatNumber(this.demographicDataState?.data?.averageSocialVulnerabilityIndex);
    },
  },
  watch: {
    // Listen for changes to zip code. Once it changes, new demographic info
    // must be fetched.
    geoState: function() {
      if (this.geoState?.geoids?.zipCode != null) {
        dispatch(getDemographicData(GeographicLevel.Zipcode, this.geoState.geoids.zipCode));
      }
    },
  },
  methods: {
    formatNumber(number: number | undefined): string | null {
      return number?.toString() ?? null;
    },
  },
});
</script>

<style scoped>

.container-wrapper {
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%
}

.container-column {
  align-items: center;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  padding: 20px;
}
</style>