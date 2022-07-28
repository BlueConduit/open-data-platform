<template>
  <SearchBar v-if="showSearch" />
  <PredictionPanel v-if="showResult" />
  <MapContainer />
</template>

<script lang="ts">
import MapContainer from '@/components/MapContainer.vue';
import SearchBar from '@/components/SearchBar.vue';
import { defineComponent } from 'vue';
import PredictionPanel from '../components/PredictionPanel.vue';
import { router, HOME_ROUTE, MAP_ROUTE } from '../router';

/**
 * This view displays the browsable map.
 */
export default defineComponent({
  name: 'MapView',
  components: {
    MapContainer,
    PredictionPanel,
    SearchBar,
  },
  data() {
    return {
      showSearch: router.currentRoute.value.path == MAP_ROUTE,
      showResult: router.currentRoute.value.path == HOME_ROUTE,
    };
  },
});
</script>

<style scoped></style>
