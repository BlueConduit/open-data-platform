<template>
  <div>
    <SearchBar v-if='showSearch' />
    <PredictionPanel v-if='showResult' />
    <MapContainer />
    <ScorecardSummaryPanel v-if='showResult' />
  </div>
</template>

<script lang='ts'>
import MapContainer from '../components/MapContainer.vue';
import PredictionPanel from '../components/PredictionPanel.vue';
import SearchBar from '../components/SearchBar.vue';
import { defineComponent } from 'vue';
import { router, SCORECARD_BASE, MAP_ROUTE_BASE } from '../router';
import ScorecardSummaryPanel from '../components/ScorecardSummaryPanel.vue';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'MapView',
  components: {
    MapContainer,
    PredictionPanel,
    SearchBar,
    ScorecardSummaryPanel,
  },
  data() {
    return {
      showSearch: router.currentRoute.value.path.startsWith(MAP_ROUTE_BASE),
      showResult: router.currentRoute.value.path.startsWith(SCORECARD_BASE),
    };
  },
});
</script>

<style scoped></style>
