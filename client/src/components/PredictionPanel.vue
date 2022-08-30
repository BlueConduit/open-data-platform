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
import { getParcel, getWaterSystem } from '../model/slices/lead_data_slice';
import { GeoDataState } from '../model/states/geo_data_state';
import { LeadDataState } from '../model/states/lead_data_state';
import { BoundedGeoDatum, GeoType } from '../model/states/model/geo_data';
import { Status } from '../model/states/status_state';

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
    // Predicted lead likelihood for parcel's public lines.
    publicLeadLikelihood(): string | null {
      // Note that low prediction is the same as high prediction in the DB
      // right now bc we don't yet have intervals
      return this.formatPercentage(this.publicLeadPercent);
    },
    // Predicted lead likelihood for parcel's private lines.
    privateLeadLikelihood(): string | null {
      // Note that low prediction is the same as high prediction in the DB
      // right now bc we don't yet have intervals
      return this.formatPercentage(this.leadState?.data?.privateLeadLowPrediction);
    },
    // Predicted estimate of lead for water systems.
    percentLead(): number | null {
      const leadServiceLines = this.leadState?.data?.leadServiceLines;
      const serviceLines = this.leadState?.data?.serviceLines;

      // Protect against dividing by 0.
      if (leadServiceLines != null && serviceLines != null && serviceLines != 0) {
        return leadServiceLines / serviceLines;
      }
      return null;
    },
    pwsId(): BoundedGeoDatum | null {
      return this.geoState?.geoids?.pwsId ?? null;
    },
    emptyGeoData(): boolean {
      return this.geoState?.geoids?.geoType == null
        && this.geoState?.geoids?.pwsId == null
        && this.geoState?.geoids?.address == null
        && this.geoState?.geoids?.zipCode == null;
    },
    showParcelPrediction(): boolean {
      return this.geoState?.geoids?.geoType == GeoType.address && this.publicLeadLikelihood != null;
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
    showNoPrediction(): boolean {
      return !this.showPrediction && !this.emptyGeoData;
    },
  },
  watch: {
    // Listen for changes to pws id or lat, long. Once it changes, a new
    // prediction must be fetched.
    'geoState.geoids': function() {
      // Check if an address was queried and another prediction should be
      // fetched.
      if (
        this.geoState?.geoids?.geoType == GeoType.address &&
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
    'geoState.status': function() {
      this.showError = this.geoState?.status?.status == Status.error;
    },
  },
  methods: {
    formatPercentage(prediction: number | undefined): string | null {
      if (prediction == null) {
        return null;
      }
      return Math.round(prediction * 100).toString();
    },
    /**
     * Takes in a prediction and produces a phrase to describe the likelihood
     * as a phrase.
     * @param prediction percent lead prediction
     */
    formatPredictionAsLikelihood(prediction: number | undefined): string | null {
      if (prediction == null) {
        return null;
      }
      switch (true) {
        case prediction <= LOW_LEAD_LIKELIHOOD:
          return ScorecardMessages.LOW_LIKELIHOOD;
        case prediction < MEDIUM_LEAD_LIKELIHOOD:
          return ScorecardMessages.MEDIUM_LIKELIHOOD;
        case prediction >= MEDIUM_LEAD_LIKELIHOOD:
          return ScorecardMessages.HIGH_LIKELIHOOD;
        default:
          return null;
      }
    },
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
