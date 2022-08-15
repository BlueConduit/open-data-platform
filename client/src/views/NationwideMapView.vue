<template>
  <SearchBar />
  <NationwideMap />
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import NationwideMap from '../components/NationwideMap.vue';
import SearchBar from '../components/SearchBar.vue';

/**
 * Wrapper for national map dashboard.
 */
export default defineComponent({
  name: 'NationwideMapView',
  components: {
    NationwideMap,
    SearchBar,
  },
});
</script>
