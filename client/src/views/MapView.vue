<template>
  <SearchBar/>
  <MapContainer/>
</template>

<script lang='ts'>
import MapContainer from '@/components/MapContainer.vue';
import SearchBar from '@/components/SearchBar.vue';
import { defineComponent } from 'vue';

/**
 * This view displays the browsable map.
 */
export default defineComponent({
  name: 'MapView',
  components: {
    MapContainer,
    SearchBar,
  },
});
</script>

<style scoped>

</style>