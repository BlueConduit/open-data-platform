<template>
  <div class='landing-page-section' :style='cssProps'>
    <h1>{{ messages.HEADER }}</h1>
    <h2>{{ $props.messages.BODY }}</h2>
    <!--    <p>{{ messages.BODY  }}</p>-->
    <slot></slot>
    <!-- TODO: Add image -->
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
    textColor: {
      type: String,
      default: '#FFFFFF',
    },
  },
  computed: {
    cssProps(): Object {
      return {
        '--text-color': this.textColor,
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
}

h1 {
  font-size: 54px;
  line-height: 60px;
}

h2 {
  font-size: 20px;
  width: 606px;
}

.landing-page-section {
  margin: 0;
  padding: 50px;
  background-color: #fff;
  text-align: center;
  vertical-align: middle;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
</style>
