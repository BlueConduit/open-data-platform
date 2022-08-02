<template>
  <div class='container'>
    <div class='explain-text'>
      {{ ScorecardSummaryMessages.LEADOUT }}
    </div>
    <map-geocoder-wrapper v-model:expandSearch='showSearch' />
    <div class='h1-header semi-bold' v-if='this.pwsId != null'>
      You have a high likelihood of lead in {{ pwsId }}.
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

/**
 * Container lead prediction.
 */
export default defineComponent({
  name: 'PredictionPanel',
  components: { MapGeocoderWrapper },
  setup() {
    const geoState = useSelector((state) => state.geosReducer);

    // Compute the water system id from the store.
    let pwsId = computed(() =>
      geoState.value.geoids?.pwsId);

    return { pwsId: pwsId };
  },
  data() {
    return {
      expandSearch: true,
      showSearch: true,
      ScorecardSummaryMessages,
    };
  },
  watch: {
    pwsId: function() {
      console.log(`Water system id changed: ${this.pwsId}`);
      if (this.pwsId != null) {
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