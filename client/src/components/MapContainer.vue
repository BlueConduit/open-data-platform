<template>
  <NationwideMap />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NationwideMap from './NationwideMap.vue';

/**
 * Wrapper for national map dashboard.
 */
export default defineComponent({
  name: 'MapContainer',
  components: {
    NationwideMap,
  },
});
</script>
