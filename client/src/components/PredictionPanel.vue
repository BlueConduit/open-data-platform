<template>
  <div class='container'>
    <div class='prediction'>
      <div v-if='showWaterSystemPrediction'>
        <div class='h1-header-xl navy'>
          {{ formatPredictionAsLikelihood(percentLead) }}
        </div>
        <div class='h2-header'>
          {{ ScorecardSummaryMessages.PREDICTION_EXPLANATION(
          formatPredictionAsLikelihoodDescriptor(percentLead)) }}
        </div>
      </div>
      <div class='h1-header'
           v-if='showParcelPrediction'>
        <div class='h1-header-xl navy'>
          {{ formatPredictionAsLikelihood(publicLeadPercent) }}
        </div>
        <div class='h2-header'>
          {{ ScorecardSummaryMessages.PREDICTION_EXPLANATION(
          formatPredictionAsLikelihoodDescriptor(publicLeadPercent)) }}
        </div>
      </div>
      <div class='no-prediction' v-if='showNoPrediction'>
        <div class='h1-header-xl navy'>
          {{ ScorecardSummaryMessages.NOT_ENOUGH_DATA_AVAILABLE }}
        </div>
        <div class='explain-text'>
          {{ ScorecardSummaryMessages.NOT_ENOUGH_DATA_EXPLAINED }}
        </div>
      </div>
      <div v-if='emptyGeoData'>
        <div class='h1-header-large navy'>
          {{ ScorecardSummaryMessages.GET_WATER_SCORE }}
        </div>
        <div class='explain-text'>
          {{ ScorecardSummaryMessages.LEAD_LIKELIHOOD_EXPLAINED }}
        </div>
      </div>
      <!--      TODO: show error message when content is finalized and showError is true.-->
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { dispatch, useSelector } from '../model/store';
import { ScorecardMessages } from '../assets/messages/scorecard_messages';
import { clearLeadData, getParcel, getWaterSystem } from '../model/slices/lead_data_slice';
import { GeoDataState } from '../model/states/geo_data_state';
import { LeadDataState } from '../model/states/lead_data_state';
import { BoundedGeoDatum, GeoType } from '../model/states/model/geo_data';
import { Status } from '../model/states/status_state';
import { GeoDataUtil } from '../util/geo_data_util';
import { LeadDataUtil } from '../util/lead_data_util';

const LOW_LEAD_LIKELIHOOD = 0.33;
const MEDIUM_LEAD_LIKELIHOOD = 0.66;

/**
 * Container lead prediction.
 */
export default defineComponent({
  name: 'PredictionPanel',
  setup() {
    // Listen to state updates.
    const geoState = useSelector((state) => state.geos) as GeoDataState;
    const leadDataState = useSelector((state) => state.leadData) as LeadDataState;

    return {
      geoState: geoState,
      leadState: leadDataState,
      showError: geoState?.status?.status == Status.error,
      formatPredictionAsLikelihood: LeadDataUtil.formatPredictionAsLikelihood,
    };
  },
  data() {
    return {
      ScorecardSummaryMessages: ScorecardMessages,
    };
  },
  computed: {
    publicLeadPercent(): number | undefined {
      return this.leadState?.data?.publicLeadLowPrediction;
    },
    // Predicted estimate of lead for water systems.
    percentLead(): number | null {
      return LeadDataUtil.waterSystemsPercentLead(this.leadState?.data);
    },
    pwsId(): BoundedGeoDatum | null {
      return this.geoState?.geoids?.pwsId ?? null;
    },
    // True if and only if there is no current search criteria. This will be false if there is a
    // search but there is no prediction data for that search.
    emptyGeoData(): boolean {
      return GeoDataUtil.isNullOrEmpty(this.geoState?.geoids);
    },
    showParcelPrediction(): boolean {
      return this.geoState?.geoids?.geoType == GeoType.address && this.publicLeadPercent != null;
    },
    showWaterSystemPrediction(): boolean {
      return (
        // Show water system prediction if it has a value and there is no parcel prediction.
        !this.showParcelPrediction &&
        this.pwsId != null &&
        this.percentLead != null
      );
    },
    showPrediction(): boolean {
      return (this.showWaterSystemPrediction || this.showParcelPrediction) && !this.showError;
    },
    // This will be true when there is no prediction but there are geo IDs, meaning that there is
    // just no prediction data for the search criteria.
    showNoPrediction(): boolean {
      return !this.showPrediction && !this.emptyGeoData;
    },
  },
  watch: {
    // Listen for changes to pws id or lat, long. Once it changes, a new
    // prediction must be fetched.
    'geoState.geoids': function() {
      dispatch(clearLeadData());

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
    'geoState.status': function() {
      this.showError = this.geoState?.status?.status == Status.error;
    },
  },
  methods: {
    /**
     * Takes in a prediction and produces a phrase to describe the likelihood
     * as an adverb.
     * @param prediction percent lead prediction
     */
    formatPredictionAsLikelihoodDescriptor(prediction: number | undefined): string | null {
      if (prediction == null) {
        return null;
      }
      switch (true) {
        case prediction <= LOW_LEAD_LIKELIHOOD:
          return ScorecardMessages.NOT_LIKELY;
        case prediction < MEDIUM_LEAD_LIKELIHOOD:
          return ScorecardMessages.SOMEWHAT_LIKELY;
        case prediction >= MEDIUM_LEAD_LIKELIHOOD:
          return ScorecardMessages.HIGHLY_LIKELY;
        default:
          return null;
      }
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.prediction div {
  @include container-column;
  @include center-container;
}

.container {
  padding: $spacing-lg;
}

.center-container {
  gap: $spacing-lg;
  padding: 0 3*$spacing-lg 0 3*$spacing-lg;
}

.justify-right {
  justify-content: right;
}
</style>
