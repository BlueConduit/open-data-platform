<template>
  <SearchBar v-if='showSearch' />
  <PredictionPanel v-if='showResult' />
  <MapContainer />
  <ScorecardSummaryPanel />
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { router, HOME_ROUTE, MAP_ROUTE } from '../router';
import MapContainer from '@/components/MapContainer.vue';
import PredictionPanel from './PredictionPanel.vue';
import ScorecardSummaryPanel from './ScorecardSummaryPanel.vue';
import SearchBar from '@/components/SearchBar.vue';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'MapContentContainer',
  components: {
    MapContainer,
    PredictionPanel,
    SearchBar,
    ScorecardSummaryPanel,
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