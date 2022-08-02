<template>
  <div class='container'>
    <map-geocoder-wrapper v-if='showSearch'
                          v-model:expandSearch='expandSearch' />
    <div class='lead-prediction' v-if='showPrediction'>
      You have a high likelihood of lead in {{ pwsId }}.
    </div>
  </div>
</template>

<script lang='ts'>
import { computed, defineComponent } from 'vue';
import MapGeocoderWrapper from './MapGeocoderWrapper.vue';
import { RootState, useSelector } from '../model/store';
import { GeoState } from '../model/geo_state';

/**
 * Container lead prediction.
 */
export default defineComponent({
  name: 'PredictionPanel',
  components: { MapGeocoderWrapper },
  setup() {
    const geoState = useSelector((state) => state.geosReducer);
    console.log(`geo state is: `);
    console.log(geoState.value);

    let pwsId = computed(() =>
      geoState.value.geoids?.pwsId);

    return { pwsId: pwsId };
  },
  data() {
    return {
      expandSearch: true,
      showSearch: true,
      showPrediction: true,
    };
  },
});
</script>

<style scoped>
.container {
  display: flex;
  height: 200px;
  justify-content: center;
  align-items: center;
}

</style>