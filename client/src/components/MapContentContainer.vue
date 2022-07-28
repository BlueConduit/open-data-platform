<template>
  <SearchBar v-if='showSearch' />
  <PredictionPanel v-if='showResult' />
  <MapContainer />
  <PredictionFactorsPanel />
</template>

<script lang='ts'>
import MapContainer from '@/components/MapContainer.vue';
import SearchBar from '@/components/SearchBar.vue';
import { defineComponent } from 'vue';
import PredictionPanel from './PredictionPanel.vue';
import { router, HOME_ROUTE, MAP_ROUTE } from '../router';
import PredictionFactorsPanel from './PredictionFactorsPanel.vue';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'MapContentContainer',
  components: {
    MapContainer,
    PredictionPanel,
    SearchBar,
    PredictionFactorsPanel,
  },
  data() {
    return {
      showSearch: router.currentRoute.value.path == MAP_ROUTE,
      showResult: router.currentRoute.value.path == HOME_ROUTE,
    };
  },
});
</script>

<style scoped>

</style>