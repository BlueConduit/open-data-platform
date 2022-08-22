<template>
  <div class='card'>
    <span class='asset'>
      <img :src='require(`@/assets/media/${content.image ?? defaultImage}`)'
           alt=''>
    </span>
    <div class='h2-header'>{{ content.header }}</div>
    <div class='h2-header'>{{ content.subHeader }}</div>
  </div>
</template>

<script lang='ts'>
/* eslint-disable */

import { defineComponent, PropType } from 'vue';
import { Content } from '../assets/messages/resources';

/**
 * Component which contains an image, a header, and a subheader.
 */
export default defineComponent({
  name: 'ImageCard',
  props: {
    image: { type: String, default: 'placeholder_image.png' },
    content: {
      type: Object as PropType<Content>,
      required: true,
    },
  },
  data() {
    return {
      defaultImage: 'placeholder_image.png',
    };
  },
});
</script>
<style scoped>
.asset img {
  width: 356px;
  height: 236px;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 396px;
  height: 449px;
  gap: 16px;
}

h1,
h2 {
  width: 356px;
  text-align: center;
  letter-spacing: 0.2px;
  text-transform: capitalize;
  padding: 0;
  margin: 0;
}

h1 {
  font-weight: 600;
  font-size: 24px;
  line-height: 29px;
  color: #212121;
}

h2 {
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #757575;
}
</style>