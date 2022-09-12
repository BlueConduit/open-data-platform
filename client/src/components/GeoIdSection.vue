<template>
  <div class='geoid-section' :class='{ selected }'>
    <div class='h2-header-large geoid'>{{ geoId }}</div>
    <div class='h2-header description'>{{ geoIdInfo }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/**
 * A single Geo ID section of the side panel.
 */
export default defineComponent({
  name: 'GeoIdSection',
  props: {
    geoId: {
      type: String,
      required: true,
    },
    geoIdInfo: {
      type: String,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped lang="scss">
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.description {
  color: $warm-grey-600;
  margin-top: 16px;
}

.geoid {
  text-transform: capitalize;
}

.geoid-section {
  width: 57 * $spacing-xs;
  height: fit-content;
  border: 1px solid $gold;
  border-radius: $spacing-xs;
  padding: $spacing-lg;
}

.selected {
  background-color: $light-gold;
}
</style>
