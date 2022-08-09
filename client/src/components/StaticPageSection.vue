<template>
  <div class='static-page-section' :style='cssProps'>
    <div class='header-section'>
      <h1>{{ messages.HEADER }}</h1>
      <h2 v-if='$props.messages.SUB_HEADER'>
        {{ $props.messages.SUB_HEADER }}</h2>
    </div>
    <slot></slot>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';

export interface Messages {
  SUB_HEADER?: string;
  HEADER: string;
  BODY: string;
  CTA_PLACEHOLDER?: string;
  CTA_BUTTON?: string;
}

export interface Styles {
  HEIGHT: string;
  BACKGROUND_COLOR: string;
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
    messages: {
      type: Object as PropType<Messages>,
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
        '--height': this.styles?.HEIGHT,
        '--background-color': this.styles?.BACKGROUND_COLOR,
      };
    },
  },
});
</script>

<style scoped>
h1 {
  width: 952px;
  height: 58px;

  font-size: 48px;
  font-weight: 600;
  line-height: 58px;
  /* identical to box height */
  display: flex;
  justify-content: center;
  letter-spacing: 0.2px;
  text-transform: capitalize;
}

h2 {
  width: 746px;
  height: 24px;

  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
  display: flex;
  justify-content: center;
  letter-spacing: 0.2px;
  text-transform: capitalize;

  /* Warm Grey/Warm Grey 600 */
  color: #7A7A7A;
}

.header-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 120px;
}

.static-page-section {
  /* Auto layout */
  /*display: flex;*/
  /*flex-direction: column;*/
  /*justify-content: center;*/
  /*align-items: center;*/
  /*padding: 80px 120px;*/
  /*gap: 70px;*/

  position: absolute;
  width: 100%;
  /*height: 816px;*/
  left: 0px;
  top: 100px;

  background: #FFFFFF;
}
</style>