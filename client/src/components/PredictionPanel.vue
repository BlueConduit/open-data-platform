<template>
  <div class='container'>
    <div class='container-row justify-right'>
      <map-geocoder-wrapper class='search' v-model:expandSearch='showSearch' />
    </div>
    <div class='container-column center-container'>
      <div class='container-column center-container'
           v-if='showWaterSystemPrediction'>
        <div class='h1-header semi-bold navy'>
          {{ formatPredictionAsLikelihood(percentLead) }}
        </div>
        <div class='h2-header'>
          {{ ScorecardSummaryMessages.PREDICTION_EXPLANATION(
          formatPredictionAsLikelihoodDescriptor(percentLead)) }}
        </div>

        <div class='h1-header semi-bold'
             v-if='showParcelPrediction'>
          Your home's public service lines have a {{ publicLeadLikelihood }}%
          chance of lead.
          <span v-if='privateLeadLikelihood != null'>
            While your private service lines have a {{ privateLeadLikelihood }}%
            chance of lead.</span>
        </div>
      </div>
      <div class='container-column center-container h1-header semi-bold navy'
           v-if='!showWaterSystemPrediction && !showParcelPrediction'>
        {{ ScorecardSummaryMessages.GET_WATER_SCORE }}
      </div>
      <div class='explain-text'>
        {{ ScorecardSummaryMessages.LEAD_LIKELIHOOD_EXPLAINED }}
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import MapGeocoderWrapper from './MapGeocoderWrapper.vue';
import { dispatch, useSelector } from '../model/store';
import { ScorecardMessages } from '../assets/messages/scorecard_messages';
import { getParcel, getWaterSystem } from '../model/slices/lead_data_slice';
import { GeoDataState } from '../model/states/geo_data_state';
import { LeadDataState } from '../model/states/lead_data_state';
import { BoundedGeoDatum, GeoType } from '../model/states/model/geo_data';

const LOW_LEAD_LIKELIHOOD = 0.33;
const MEDIUM_LEAD_LIKELIHOOD = 0.66;
const HIGH_LEAD_LIKELIHOOD = 1;

/**
 * Container lead prediction.
 */
export default defineComponent({
  name: 'PredictionPanel',
  components: { MapGeocoderWrapper },
  setup() {
    // Listen to state updates.
    const geoState = useSelector((state) => state.geos) as GeoDataState;
    const leadDataState = useSelector((state) => state.leadData) as LeadDataState;

    return {
      geoState: geoState,
      leadState: leadDataState,
    };
  },
  data() {
    return {
      expandSearch: true,
      showSearch: true,
      ScorecardSummaryMessages: ScorecardMessages,
    };
  },
  // TODO: Handle error state where there is no lead prediction
  // after the API has returned.
  computed: {
    // Predicted lead likelihood for parcel's public lines.
    publicLeadLikelihood(): string | null {
      // Note that low prediction is the same as high prediction in the DB
      // right now bc we don't yet have intervals
      return this.formatPercentage(this.leadState?.data?.publicLeadLowPrediction);
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
      // TODO: Handle error state where there is no water system id
      // after the API has returned.
      return this.geoState?.geoids?.pwsId ?? null;
    },
    showParcelPrediction(): boolean {
      return this.geoState?.geoids?.geoType == GeoType.address && this.publicLeadLikelihood != null;
    },
    showWaterSystemPrediction(): boolean {
      return this.geoState?.geoids?.geoType != GeoType.address && this.pwsId != null && this.percentLead != null;
    },
  },
  watch: {
    // Listen for changes to pws id or lat, long. Once it changes, a new
    // prediction must be fetched.
    'geoState.geoids': function() {
      // Check if an address was queried and another prediction should be
      // fetched.
      if (this.geoState?.geoids?.geoType == GeoType.address
        && this.geoState?.geoids?.lat != null
        && this.geoState?.geoids?.long != null) {

        dispatch(getParcel(this.geoState.geoids.lat, this.geoState.geoids.long));

      } else if (this.geoState?.geoids?.pwsId != null) {
        dispatch(getWaterSystem(this.geoState.geoids.pwsId.id));
      }
    },
  },
  methods: {
    formatPercentage(prediction: number | undefined): string | null {
      if (prediction == null || prediction == 0) {
        return null;
      }
      return Math.round(prediction * 100).toString();
    },
    formatPredictionAsLikelihood(prediction: number | undefined): string | null {
      if (prediction == null || prediction == 0) {
        return null;
      }
      switch (true) {
        case prediction < LOW_LEAD_LIKELIHOOD:
          return ScorecardMessages.LOW_LIKELIHOOD;
        case prediction < MEDIUM_LEAD_LIKELIHOOD:
          return ScorecardMessages.MEDIUM_LIKELIHOOD;
        case prediction < HIGH_LEAD_LIKELIHOOD:
          return ScorecardMessages.HIGH_LIKELIHOOD;
        default:
          return null;
      }
    },
    formatPredictionAsLikelihoodDescriptor(prediction: number | undefined): string | null {
      if (prediction == null || prediction == 0) {
        return null;
      }
      switch (true) {
        case prediction < LOW_LEAD_LIKELIHOOD:
          return ScorecardMessages.NOT_LIKELY;
        case prediction < MEDIUM_LEAD_LIKELIHOOD:
          return ScorecardMessages.SOMEWHAT_LIKELY;
        case prediction < HIGH_LEAD_LIKELIHOOD:
          return ScorecardMessages.HIGHLY_LIKELY;
        default:
          return null;
      }
    },
  },
});
</script>

<style scoped>

.container {
  padding-bottom: 20px;
}

.center-container {
  gap: 20px;
  padding: 0 60px 0 60px;
}

.justify-right {
  justify-content: right;
}

.search {
  margin: 20px;
  max-width: 350px;
}

</style>