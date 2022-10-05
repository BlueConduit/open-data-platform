<template>
  <div :style='cssVars'>
    <div class='title-section is-flex has-text-centered'>
      <div class='h1-header-large'>
        {{ title }}
      </div>
    </div>
    <div class='section is-flex' v-html='content'></div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'BlogView',
  props: {
    title: {
      type: String,
      default: 'LeadOut Blog',
    }, content: {
      type: String,
      required: true,
    }, image: {
      type: String,
      required: true,
    },
  },
  computed: {
    cssVars() {
      return {
        '--background-image': `url(${require(`@/assets/media/${this.image}`)}`,
      };
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';
@import 'bulma/sass/elements/container';
@import 'bulma/sass/layout/section.sass';
@import 'bulma/sass/grid/columns.sass';

.title-section {
  @include background-image;
  @include center-container;

  // Use a semi-opaque gradient to tint the background image for better text readability.
  background-image: linear-gradient(rgba(0, 96, 100, 0.75), rgba(0, 96, 100, 0.75)), var(--background-image);
}

.h1-header-large {
  color: $white;
}
</style>