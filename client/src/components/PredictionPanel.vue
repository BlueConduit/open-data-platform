<template>
  <div class='container'>
    <map-geocoder-wrapper v-if='showSearch' v-model='expandSearch' />
    <div class='lead-prediction' v-if='showPrediction'>
      You have a high likelihood of lead.
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import MapGeocoderWrapper from './MapGeocoderWrapper.vue';

/**
 * Container lead prediction.
 */
export default defineComponent({
  name: 'PredictionPanel',
  components: { MapGeocoderWrapper },
  data() {
    return {
      expandSearch: true,
      showSearch: true,
      showPrediction: false,
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

.lead-prediction {

}
</style>