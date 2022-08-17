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

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { LandingPageStyles, Style } from '../../assets/styles/style_props';

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
    styles: {
      type: Object as PropType<Style>,
      required: true,
    },
  },
  computed: {
    cssProps(): Object {
      return {
        '--header-text-color': this.styles.headerTextColor ?? LandingPageStyles.DEFAULT_STYLE.headerTextColor,
        '--subheader-text-color': this.styles.subHeaderTextColor ?? LandingPageStyles.DEFAULT_STYLE.subHeaderTextColor,
        '--header-text-size': this.styles.headerTextSize ?? LandingPageStyles.DEFAULT_STYLE.headerTextSize,
        '--subheader-text-size': this.styles.subheaderTextSize ?? LandingPageStyles.DEFAULT_STYLE.subheaderTextSize,
        '--background-color': this.styles.backgroundColor ?? LandingPageStyles.DEFAULT_STYLE.backgroundColor,
        '--height': this.styles.height ?? LandingPageStyles.DEFAULT_STYLE.height,
      };
    },
  },
});
</script>

<style scoped>
h1, h2 {
  font-weight: 500;
  padding: 0;
  margin: 0;
  text-align: center;
}

h1 {
  color: var(--header-text-color);
  font-size: var(--header-text-size);
  line-height: 60px;
}

h2 {
  color: var(--subheader-text-color);
  font-size: var(--subheader-text-size);
  max-width: 733px;
  gap: 16px;
  line-height: 30px;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.landing-page-section {
  margin: 0;
  background-color: var(--background-color);
  text-align: center;
  vertical-align: middle;
  height: var(--height);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 50px;
}
</style>
