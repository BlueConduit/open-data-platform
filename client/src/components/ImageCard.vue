<template>
  <div class='card'>
    <span class='asset'>
      <img :src='require(`@/assets/media/${image}`)'
           alt=''>
    </span>
    <div class='h1-header'>{{ header }}</div>
  </div>
</template>

<script lang='ts'>
/* eslint-disable */

import { defineComponent } from 'vue';

/**
 * Component which contains an image, a header, and a subheader.
 */
export default defineComponent({
  name: 'ImageCard',
  props: {
    image: { type: String, default: 'placeholder_image.png' },
    header: {
      type: String,
      required: true,
    },
  },
});
</script>
<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.asset img {
  width: 350px;
  height: 240px;
}

.card {
  @include center-container;
  @include container-column;

  width: 400px;
  height: 425px;
  gap: $spacing-sm;
}

.h1-header {
  color: $warm-grey-900;
  text-transform: capitalize;
  font-weight: 600;
}
</style>