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
import { computed, defineComponent } from 'vue';
import MapGeocoderWrapper from './MapGeocoderWrapper.vue';
import { dispatch, useSelector } from '../model/store';
import { ScorecardSummaryMessages } from '../assets/messages/scorecard_summary_messages';
import { getWaterSystem } from '../model/geo_slice';
import { ScorecardData } from '../model/scorecard';

/**
 * Container lead prediction.
 */
export default defineComponent({
  name: 'PredictionPanel',
  components: { MapGeocoderWrapper },
  setup() {
    const geoState = useSelector((state) => state.geosReducer);

    // Listen to geo state changes for water system id.
    let pwsId = computed<string>(() =>
      geoState.value.geoids?.pwsId ?? '');

    // Listen to geo state changes for scorecard.
    let scorecard = computed<ScorecardData | undefined>(() =>
      geoState.value.scorecard);

    return {
      pwsId: pwsId,
      scorecard: scorecard,
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
    percentLead(): number | null {
      const leadServiceLines = this.scorecard?.leadServiceLines;
      const serviceLines = this.scorecard?.serviceLines;

      // Protect against dividing by 0
      if (leadServiceLines != null && serviceLines != null && serviceLines != 0) {
        return Math.round(leadServiceLines / serviceLines);
      }
      return null;
    },
  },
  watch: {
    pwsId: function() {
      if (this.pwsId != null) {
        // When the water system id changes, this component sends event to
        // get a water system.
        dispatch(getWaterSystem(this.pwsId));
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