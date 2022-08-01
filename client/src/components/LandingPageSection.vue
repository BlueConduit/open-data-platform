<template>
  <div class="landing-page-map-info">
    <h2 v-if="$props.messages.SUPER_HEADER">{{ $props.messages.SUPER_HEADER }}</h2>
    <h1>{{ messages.HEADER }}</h1>
    <p>{{ messages.BODY }}</p>
    <input :placeholder="$props.messages.CTA_PLACEHOLDER" v-if="$props.messages.CTA_PLACEHOLDER" />
    <button>{{ messages.CTA_BUTTON }}</button>
    <!-- TODO: Add image -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export interface Messages {
  SUPER_HEADER?: string;
  HEADER: string;
  BODY: string;
  CTA_PLACEHOLDER?: string;
  CTA_BUTTON: string;
}

/**
 * A component for searching for a scorecard.
 */
export default defineComponent({
  name: 'LandingPageSection',
  props: {
    messages: {
      type: Object as () => Messages,
      required: true,
    },
  },
});
</script>

<style scoped>
.landing-page-map-info {
  text-align: center;
  vertical-align: middle;
}
</style>
