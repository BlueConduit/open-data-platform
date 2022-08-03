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
import { dispatch, RootState, store, useSelector } from '../model/store';
import { ScorecardSummaryMessages } from '../assets/messages/scorecard_summary_messages';
import { LeadData } from '../model/lead_data';
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
    // const geoState = useSelector<GeoState>((state) => state.geos);
    const geoState = useSelector((state) => state.geos) as GeoState;
    const leadDataState = useSelector((state) => state.leadData) as LeadDataState;

    let state: RootState | null = null;
    // store.subscribe(() => {
    //   // state = store.getState();
    //   // console.log(`inside component ${JSON.stringify(state)}`);
    //   // dispatch(getWaterSystem(state.geos.geoids?.pwsId ?? ''));
    // });

    // Listen to geo state changes for water system id.
    let pwsId = computed<string>(() =>
      geoState.geoids?.pwsId ?? '');

    // Listen to geo state changes for data.
    let leadData = computed<LeadData | undefined>(() =>
      leadDataState.data);

    return {
      pwsId: pwsId,
      leadData: leadData,
      state: state,
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
      const leadServiceLines = this.leadData?.leadServiceLines;
      const serviceLines = this.leadData?.serviceLines;

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
        console.log(`pws id has updated ${this.pwsId}`);
        dispatch(getWaterSystem(this.pwsId));
      }
    },
    state: function() {
      if (this.state != null) {
        console.log(`pws id has updated ${this.state}`);
        //dispatch(getWaterSystem(this.pwsId));
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