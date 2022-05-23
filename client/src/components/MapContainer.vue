<template>
  <MapView/>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import MapView from './MapView.vue'

/**
 * Wrapper for national map dashboard.
 */
export default defineComponent({
  name: 'MapContainer',
  components: {
    MapView
  }
})
</script>