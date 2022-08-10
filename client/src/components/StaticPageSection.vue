<template>
  <div class='static-page-section' :style='cssProps'>
    <div class='header-section'>
      <h1>{{ message.header }}</h1>
      <h2 v-if='message.subHeader'>
        {{ message.subHeader }}</h2>
    </div>
    <slot class='content-slot'></slot>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { Message } from '../assets/messages/resources';

export interface Styles {
  BACKGROUND_COLOR: string;
  HEADER_TEXT_COLOR?: string;
  SUB_HEADER_TEXT_COLOR?: string;
}

/**
 * A component that displays basic content on the landing page. It can accept inner components for
 * extra functionality, such as buttons, links, or videos. The purpose of this component is to
 * keep the landing page DRY and define style in one place.
 */
export default defineComponent({
  name: 'StaticPageSection',
  // TODO: add props to customize basic styling. E.g. background color.
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true,
    },
    styles: {
      type: Object as PropType<Styles>,
      required: true,
    },
  },
  computed: {
    cssProps(): Object {
      return {
        '--background-color': this.styles?.BACKGROUND_COLOR,
        '--header-text-color': this.styles?.HEADER_TEXT_COLOR,
        '--sub-header-text-color': this.styles?.SUB_HEADER_TEXT_COLOR,
      };
    },
  },
});
</script>

<style scoped>
h1 {
  height: 48px;

  /* Display 2 */
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 40px;
  line-height: 48px;
  /* identical to box height, or 120% */
  text-align: center;

  color: var(--header-text-color);

  /* Inside auto layout */
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;

}

h2 {
  width: 733px;
  height: 68px;

  /* Headline 2 */
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 34px;
  /* or 142% */
  text-align: center;

  /* Warm Grey/Warm Grey 900 */
  color: var(--sub-header-text-color);

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

.header-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.static-page-section {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 100px;
  padding: 35px 25px;
  background-color: var(--background-color);
}
</style>