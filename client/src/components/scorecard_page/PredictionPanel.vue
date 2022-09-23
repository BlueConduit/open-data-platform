<template>
  <div class='section'>
    <div class='container has-text-centered'>
      <div>
        <div class='h1-header-xl navy'>
          {{ predictionString }}
        </div>
        <div class='h2-header'>
          {{ explanationString }}
        </div>
      </div>
      <!--      TODO: show error message when content is finalized and showError is true.-->
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { dispatch, useSelector } from '../../model/store';
import { ScorecardMessages } from '../../assets/messages/scorecard_messages';
import { GeoDataState } from '../../model/states/geo_data_state';
import { LeadDataState } from '../../model/states/lead_data_state';
import { BoundedGeoDatum, GeoType } from '../../model/states/model/geo_data';
import { Status } from '../../model/states/status_state';
import { GeoDataUtil } from '../../util/geo_data_util';
import { LeadDataUtil } from '../../util/lead_data_util';
import { setZoomLevel } from '../../model/slices/map_data_slice';
import { ZoomLevel } from '../../model/states/model/map_data';
import { queryLatLong } from '../../model/slices/geo_data_slice';

const CENTER_US = [-98.5556199, 39.8097343];

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
    predictionString(): string {
      if (this.showWaterSystemPrediction) {
        return (
          this.formatPredictionAsLikelihood(this.percentLead) ??
          this.ScorecardSummaryMessages.NOT_ENOUGH_DATA_AVAILABLE
        );
      }
      if (this.showParcelPrediction) {
        return (
          this.formatPredictionAsLikelihood(this.publicLeadPercent) ??
          this.ScorecardSummaryMessages.NOT_ENOUGH_DATA_AVAILABLE
        );
      }
      if (this.showNoPrediction) {
        return this.ScorecardSummaryMessages.NOT_ENOUGH_DATA_AVAILABLE;
      }
      return this.ScorecardSummaryMessages.GET_WATER_SCORE;
    },
    explanationString(): string {
      if (this.showWaterSystemPrediction)
        return this.ScorecardSummaryMessages.PREDICTION_EXPLANATION(
          this.formatPredictionAsLikelihoodDescriptor(this.percentLead) ?? '',
        );
      if (this.showParcelPrediction)
        return this.ScorecardSummaryMessages.PREDICTION_EXPLANATION(
          this.formatPredictionAsLikelihoodDescriptor(this.publicLeadPercent) ?? '',
        );
      if (this.showNoPrediction) return this.ScorecardSummaryMessages.NOT_ENOUGH_DATA_EXPLAINED;
      return this.ScorecardSummaryMessages.LEAD_LIKELIHOOD_EXPLAINED;
    },
    publicLeadPercent(): number | null {
      return this.leadState?.data?.publicLeadLowPrediction ?? null;
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
        !this.showParcelPrediction && this.pwsId != null && this.percentLead != null
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
    formatPredictionAsLikelihoodDescriptor(prediction: number | null): string | null {
      if (prediction == null) {
        return null;
      }
      switch (true) {
        case prediction <= LeadDataUtil.LOW_LEAD_LIKELIHOOD:
          return ScorecardMessages.NOT_LIKELY;
        case prediction < LeadDataUtil.MEDIUM_LEAD_LIKELIHOOD:
          return ScorecardMessages.SOMEWHAT_LIKELY;
        case prediction >= LeadDataUtil.MEDIUM_LEAD_LIKELIHOOD:
          return ScorecardMessages.HIGHLY_LIKELY;
        default:
          return null;
      }
    },
  },
});
</script>

<style scoped lang='scss'>
@import 'src/assets/styles/global';
@import '@blueconduit/copper/scss/01_settings/design-tokens';
@import 'bulma/sass/elements/container';
</style>
