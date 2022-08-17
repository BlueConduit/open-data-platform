<template>
  <div class='container-column'>
    <div class='container-row justify-right'>
      <map-geocoder-wrapper class='search' v-model:expandSearch='showSearch' />
    </div>
    <div class='container-column center-container'>
      <div class='explain-text'>
        {{ ScorecardSummaryMessages.LEADOUT }}
      </div>
      <div class='h1-header semi-bold'
           v-if='showWaterSystemPrediction'>
        Your neighborhood water system {{ pwsId }} is likely
        {{ percentLead }}% lead.
      </div>
      <div class='h1-header semi-bold'
           v-if='showParcelPrediction'>
        Your home's public service lines have a {{ publicLeadLikelihood }}%
        chance of lead.
        <span v-if='privateLeadLikelihood != null'>
          While your private service lines have a {{ privateLeadLikelihood }}%
          chance of lead.</span>
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
    percentLead(): string | null {
      const leadServiceLines = this.leadState?.data?.leadServiceLines;
      const serviceLines = this.leadState?.data?.serviceLines;

      // Protect against dividing by 0.
      if (leadServiceLines != null && serviceLines != null && serviceLines != 0) {
        return this.formatPercentage(leadServiceLines / serviceLines);
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
    formatPercentage(number: number | undefined): string | null {
      if (number == null || number == 0) {
        return null;
      }
      return Math.round(number * 100).toString();
    },
  },
});
</script>

<style scoped>

.center-container {
  gap: 20px;
  height: 200px;
}

.justify-right {
  justify-content: right;
}

.search {
  margin: 20px;
  max-width: 350px;
}

</style>