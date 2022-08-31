<template>
  <div>
    <SearchBar />
    <NationwideMap :static='false' />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NationwideMap from '../components/NationwideMap.vue';
import SearchBar from '../components/SearchBar.vue';

/**
 * Wrapper for national map dashboard.
 */
export default defineComponent({
  name: 'NationwideMapView',
  components: {
    SearchBar,
    NationwideMap,
  },
});
</script>
