<template>
  <div :style='cssVars'>
    <div class='title-section is-flex has-text-centered'>
      <div class='h1-header-large'>
        {{ title }}
      </div>
    </div>
    <div class='section content' v-html='content'></div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';

/**
 * Very simple blog page that support title, image, and basic HTML injection.
 */
export default defineComponent({
  name: 'BlogView', props: {
    title: {
      type: String, default: 'LeadOut Blog',
    }, content: {
      type: String, required: true,
    }, image: {
      type: String, required: true,
    },
  }, computed: {
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

.title-section {
  @include background-image;

  // Use a semi-opaque gradient to tint the background image for better text readability.
  background-image: linear-gradient(rgba(0, 96, 100, 0.75), rgba(0, 96, 100, 0.75)), var(--background-image);
  align-items: center;
  justify-content: center;
}

.h1-header-large {
  color: $white;
}
</style>