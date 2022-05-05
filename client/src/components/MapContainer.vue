<template>
  <MapView/>
</template>

<script>
import MapView from './MapView.vue'

/**
 * Wrapper for national map dashboard.
 */
export default {
  name: 'MapContainer',
  components: {
    MapView
  }
}
</script>