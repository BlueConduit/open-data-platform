<template>
  <SearchBar :initial-selected-option="this.options[0]"
             :options="this.options"></SearchBar>
  <MapView/>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import MapView from './MapView.vue'
import SearchBar from './SearchBar.vue'

/**
 * Wrapper for national map dashboard.
 */
export default defineComponent({
  name: 'MapContainer',
  components: {
    MapView,
    SearchBar,
  },
  data() {
    return {
      options: ['Population'],
    }
  }
})
</script>