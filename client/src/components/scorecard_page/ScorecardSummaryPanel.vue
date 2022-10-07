<template>
  <div class='section center-container has-text-centered'>
    <div class='h1-header-large'>
      <div>
        {{ ScorecardSummaryMessages.SCORECARD_SUMMARY_PANEL_HEADER(zipCode) }}
      </div>
    </div>
    <div class='subheader'>
      {{ ScorecardSummaryMessages.SCORECARD_SUMMARY_PANEL_SUBHEADER }}
    </div>
    <div class='columns is-desktop'>
      <ScorecardSummaryRow
        class='column'
        :header='ScorecardSummaryMessages.HOME_AGE'
        :subheader='ScorecardSummaryMessages.HOME_AGE_EXPLAINED'
        :comparisonValue='homeAgeComparison' />
      <ScorecardSummaryRow
        class='column'
        :header='ScorecardSummaryMessages.AREA_DEPRIVATION_INDEX'
        :subheader='ScorecardSummaryMessages.AREA_DEPRIVATION_INDEX_EXPLAINED'
        :comparisonValue='areaDeprivationIndexComparison'
        learnMoreLink='https://www.neighborhoodatlas.medicine.wisc.edu/' />
      <ScorecardSummaryRow
        class='column'
        :header='ScorecardSummaryMessages.INCOME_LEVEL'
        :subheader='ScorecardSummaryMessages.INCOME_LEVEL_EXPLAINED'
        :comparisonValue='incomeComparison' />
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ScorecardMessages } from '../../assets/messages/scorecard_messages';
import ScorecardSummaryRow from './ScorecardSummaryRow.vue';
import { dispatch, useSelector } from '../../model/store';
import { GeoDataState } from '../../model/states/geo_data_state';
import { DemographicDataState } from '../../model/states/demographic_data_state';
import { GeographicLevel } from '../../model/data_layer';
import { getDemographicData } from '../../model/slices/demographic_data_slice';

// Taken from https://www.neighborhoodatlas.medicine.wisc.edu/.
const LOWEST_DISADVANTAGE = 33;
const MEDIUM_DISADVANTAGE = 66;

const LOWEST_INCOME_PERCENTILE = 3;
const MIDDLE_INCOME_PERCENTILE = 6;

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
    const geoState = useSelector((state) => state.geos) as GeoDataState;
    const demographicData = useSelector((state) => state.demographicData) as DemographicDataState;

    return {
      geoState: geoState,
      demographicDataState: demographicData,
    };
  },
  data() {
    return {
      ScorecardSummaryMessages: ScorecardMessages,
    };
  },
  beforeMount() {
    this.getDemographicDataForZip();
  },
  computed: {
    homeAgeComparison(): string | null {
      const homeAge = this.roundNumber(this.demographicDataState?.data?.averageHomeAge);
      return homeAge != null ? `${homeAge} years old` : null;
    },
    incomeComparison(): string | null {
      const income = this.roundNumber(this.demographicDataState?.data?.averageIncome);

      if (income == null) {
        return null;
      }

      switch (true) {
        case income <= LOWEST_INCOME_PERCENTILE:
          return ScorecardMessages.HIGHER_INCOME;
        case income < MIDDLE_INCOME_PERCENTILE:
          return ScorecardMessages.AVERAGE_INCOME;
        case income >= MIDDLE_INCOME_PERCENTILE:
          return ScorecardMessages.LOWER_INCOME;
        default:
          return null;
      }
    },
    areaDeprivationIndexComparison(): string | null {
      const adi = this.roundNumber(
        this.demographicDataState?.data?.averageSocialVulnerabilityIndex,
      );

      if (adi == null) {
        return null;
      }

      switch (true) {
        case adi <= LOWEST_DISADVANTAGE:
          return ScorecardMessages.HIGHLY_DISADVANTAGED;
        case adi < MEDIUM_DISADVANTAGE:
          return ScorecardMessages.SOMEWHAT_DISADVANTAGED;
        case adi >= MEDIUM_DISADVANTAGE:
          return ScorecardMessages.LESS_DISADVANTAGED;
        default:
          return null;
      }
    },
    zipCode(): string | null {
      return this.geoState?.geoids?.zipCode?.id ?? null;
    },
  },
  watch: {
    // Listen for changes to zip code. Once it changes, new demographic info
    // must be fetched.
    'geoState.geoids.zipCode': function() {
      this.getDemographicDataForZip();
    },
  },
  methods: {
    getDemographicDataForZip() {
      if (this.geoState?.geoids?.zipCode != null) {
        dispatch(getDemographicData(GeographicLevel.ZipCode, this.geoState.geoids.zipCode.id));
      }
    },
    roundNumber(number: number | undefined): number | null {
      if (number == null) {
        return null;
      }
      return Math.round(number);
    },
  },
});
</script>

<style scoped lang='scss'>
@import 'src/assets/styles/global';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.section.has-text-centered {
  @include background-image;

  // Use a semi-opaque gradient to tint the background image for better text readability.
  background-image: linear-gradient(rgba(4, 86, 155, 0.75), rgba(4, 86, 155, 0.75)),
  url('~@/assets/media/understand-score.png');
  color: $white;

  // Using .is-medium makes this section far too large.
  min-height: 50vh;
}

</style>
