<template>
  <div class='container'>
    <div class='explain-text'>
      {{ ScorecardSummaryMessages.LEADOUT }}
    </div>
    <map-geocoder-wrapper v-model:expandSearch='showSearch' />
    <div class='h1-header semi-bold'
         v-if='this.pwsId != null && percentLead != null'>
      Your neighborhood water system {{ pwsId }} is likely
      {{ percentLead }}% lead.
    </div>
    <div class='h1-header semi-bold'
         v-if='this.publicLeadLikelihood != null'>
      Your home's public service lines have a {{ publicLeadLikelihood }}%
      chance of lead.
      <span v-if='this.privateLeadLikelihood != null'>
        While your private service lines have a {{ privateLeadLikelihood }}%
        chance of lead.</span>
    </div>
    <div class='explain-text'>
      {{ ScorecardSummaryMessages.LEAD_LIKELIHOOD_EXPLAINED }}
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import MapGeocoderWrapper from './MapGeocoderWrapper.vue';
import { dispatch, useSelector } from '../model/store';
import { ScorecardSummaryMessages } from '../assets/messages/scorecard_summary_messages';
import { getParcel, getWaterSystem } from '../model/slices/lead_data_slice';
import { GeoDataState } from '../model/states/geo_data_state';
import { LeadDataState } from '../model/states/lead_data_state';
import { GeoType } from '../model/states/model/geo_data';

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
      ScorecardSummaryMessages,
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
    pwsId(): string | null {
      // TODO: Handle error state where there is no water system id
      // after the API has returned.
      return this.geoState?.geoids?.pwsId ?? null;
    },
  },
  watch: {
    // Listen for changes to pws id. Once it changes, a new prediction
    // must be fetched.
    'geoState.geoids': function() {
      // Check if an address was queried and another prediction should be
      // fetched.
      if (this.geoState?.geoids?.geoType == GeoType.address
        && this.geoState?.geoids?.lat != null
        && this.geoState?.geoids?.long != null) {

        dispatch(getParcel(this.geoState.geoids.lat, this.geoState.geoids.long));
      } else if (this.geoState?.geoids?.pwsId != null) {
        dispatch(getWaterSystem(this.geoState.geoids.pwsId));
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
.container {
  align-items: center;
  display: flex;
  gap: 20px;
  height: 200px;
  justify-content: center;
  flex-direction: column;
}

</style>