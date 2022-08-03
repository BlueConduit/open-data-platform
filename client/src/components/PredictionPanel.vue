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
import { getWaterSystem } from '../model/slices/lead_data_slice';
import { GeoState } from '../model/states/geo_state';
import { LeadDataState } from '../model/states/lead_data_state';

/**
 * Container lead prediction.
 */
export default defineComponent({
  name: 'PredictionPanel',
  components: { MapGeocoderWrapper },
  setup() {
    // Listen to state updates.
    const geoState = useSelector((state) => state.geos) as GeoState;
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
  computed: {
    // Predicted estimate of lead.
    percentLead(): number | null {
      const leadServiceLines = this.leadState?.data?.leadServiceLines;
      const serviceLines = this.leadState?.data?.serviceLines;

      // Protect against dividing by 0
      if (leadServiceLines != null && serviceLines != null && serviceLines != 0) {
        return Math.round(leadServiceLines / serviceLines);
      }
      return null;
    },
    pwsId(): string | null {
      return this.geoState?.geoids?.pwsId ?? null;
    },
  },
  watch: {
    // Listen for changes to pws id. Once it changes, a new prediction
    // must be fetched.
    geoState: function() {
      if (this.geoState?.geoids?.pwsId != null) {
        dispatch(getWaterSystem(this.geoState.geoids.pwsId));
      }
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