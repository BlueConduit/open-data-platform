<template>
  <div class='card'>
    <span class='asset'><img
      :src='require(`@/assets/media/${image}`)'
      alt=''></span>
    <div class='text'>
      <h1>{{ message.header }}</h1>
      <h2>{{ message.subHeader }}</h2>
    </div>
  </div>
</template>

<script lang='ts'>
// TODO remove this and configure linter in intellij
/* eslint-disable */

import { defineComponent, PropType } from 'vue';
import { Message } from '../assets/messages/resources';

/**
 * Wrapper for national map dashboard.
 */
export default defineComponent({
  name: 'ImageCard',
  props: {
    image: { type: String, default: 'placeholder_image.png' },
    message: {
      type: Object as PropType<Message>,
      default: 'placeholder_image.png',
    },
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
}

h1 {
  width: 356px;
  height: 58px;

  font-weight: 600;
  font-size: 24px;
  line-height: 29px;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: 0.2px;
  text-transform: capitalize;

  /* systemGrey/900 */
  color: #212121;


  /* Inside auto layout */
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

h2 {
  width: 356px;

  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  /* or 150% */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  letter-spacing: 0.2px;
  text-transform: capitalize;

  /* systemGrey/600 */
  color: #757575;


  /* Inside auto layout */
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

.text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>