<template>
  <div class='resources-page-section' :style='cssProps'>
    <div class='header-section'>
      <h1>{{ content.header }}</h1>
      <h2 class='header-2' v-if='content.subHeader'>
        {{ content.subHeader }}
      </h2>
    </div>
    <slot class='content-slot'></slot>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { Style } from '@/assets/styles/resources';
import { Content } from '../../assets/messages/resources';

export interface Styles {
  BACKGROUND_COLOR: string;
  HEADER_TEXT_COLOR?: string;
  SUB_HEADER_TEXT_COLOR?: string;
}

/**
 * A component that displays basic content on the resources page. It can accept inner components for
 * extra functionality, such as buttons, links, or videos. The purpose of this component is to
 * keep the resources page DRY and define style in one place.
 */
export default defineComponent({
  name: 'StaticPageSection',
  props: {
    content: {
      type: Object as PropType<Content>,
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
        '--background-color': this.styles?.backgroundColor,
        '--header-text-color': this.styles?.headerTextColor,
        '--sub-header-text-color': this.styles?.subHeaderTextColor,
      };
    },
  },
});
</script>

<style scoped>
h1 {
  width: 100%;
  height: 48px;
  padding: 0;
  margin: 0;

  font-weight: 500;
  font-size: 40px;
  line-height: 48px;
  text-align: center;
  text-transform: capitalize;

  color: var(--header-text-color);
}

h2 {
  width: 733px;
  height: 68px;
  padding: 0;
  margin: 0;

  font-weight: 500;
  font-size: 24px;
  line-height: 34px;
  text-align: center;
  color: var(--sub-header-text-color);
}

.header-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: 16px;
  height: 162px;
  width: 974px;
  padding: 0;
}

.resources-page-section {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  padding: 35px 25px;
  gap: 24px;
  background-color: var(--background-color);
}
</style>