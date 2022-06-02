<template>
  <SearchBar/>
  <MapContainer/>
</template>

<script lang='ts'>
import MapContainer from '@/components/MapContainer.vue';
import SearchBar from '@/components/SearchBar.vue';
import { defineComponent } from 'vue';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'MapContentContainer',
  components: {
    MapContainer,
    SearchBar,
  },
});
</script>

<style scoped>

</style>