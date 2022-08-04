<template>
  <div class='landing-page-section'>
    <h2 v-if='$props.messages.SUPER_HEADER'>{{ $props.messages.SUPER_HEADER }}</h2>
    <h1>{{ messages.HEADER }}</h1>
    <p>{{ messages.BODY }}</p>
    <slot></slot>
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
 * A component that displays basic content on the landing page. It can accept inner components for
 * extra functionality, such as buttons, links, or videos. The purpose of this component is to
 * keep the landing page DRY and define style in one place.
 */
export default defineComponent({
  name: 'LandingPageSection',
  // TODO: add props to customize basic styling. E.g. background color.
  props: {
    messages: {
      type: Object as () => Messages,
      required: true,
    },
  },
});
</script>

<style scoped>
.landing-page-section {
  margin: 0;
  padding: 50px;
  background-color: #fff;
  text-align: center;
  vertical-align: middle;
}
</style>
