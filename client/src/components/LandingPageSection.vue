<template>
  <div class='landing-page-section' :style='cssProps'>
    <div class='header-section'>
      <h2>{{ messages.SUPER_HEADER }}</h2>
      <h1>{{ messages.HEADER }}</h1>
      <h2>{{ $props.messages.BODY }}</h2>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export interface Messages {
  SUPER_HEADER?: string;
  HEADER: string;
  BODY: string;
  CTA_PLACEHOLDER?: string;
  CTA_BUTTON?: string;
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
      type: Object as PropType<Messages>,
      required: true,
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF', // White.
    },
    textColor: {
      type: String,
      default: '#464646', // Warm grey.
    },
    headerSize: {
      type: String,
      default: '54px',
    },
    subheaderSize: {
      type: String,
      default: '20px',
    },
  },
  computed: {
    cssProps(): Object {
      return {
        '--text-color': this.textColor,
        '--header-size': this.headerSize,
        '--subheader-size': this.subheaderSize,
        '--background-color': this.backgroundColor,
      };
    },
  },
});
</script>

<style scoped>
h1, h2 {
  color: var(--text-color);
  font-weight: 500;
  padding: 0;
  margin: 0;
  text-align: center;
}

h1 {
  font-size: var(--header-size);
  line-height: 60px;
}

h2 {
  font-size: var(--subheader-size);
  max-width: 733px;
  gap: 16px;
  line-height: 30px;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.landing-page-section {
  margin: 0;
  padding: 71px 25px;
  background-color: var(--background-color);
  text-align: center;
  vertical-align: middle;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
}
</style>
