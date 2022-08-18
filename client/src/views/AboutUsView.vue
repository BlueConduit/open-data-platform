<template>
  <div class='about-us'>
    <div class='text'>
      <div class='h1-header-xxl'>{{ messages.HEADER }}</div>
      <div class='h1-header'>
        {{ messages.BODY_1 }}
        <p></p>
        {{ messages.BODY_2 }}
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { AboutUs as messages } from '@/assets/messages/about_us';

/**
 * About Us page component.
 */
export default defineComponent({
  name: 'AboutUsView',
  data() {
    return {
      messages,
    };
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.about-us {
  height: 100%;
  background-color: $light-blue-800;
  background-image: url('~@/assets/media/about-us-image.png');
  background-size: cover;
  background-repeat: no-repeat;
  color: $white;
}

.h1-header {
  width: 169 * $spacing-xs;
}

.h1-header-xxl {
  font-weight: 600;
  line-height: 15 * $spacing-xs;
  text-transform: capitalize;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 17 * $spacing-xs;
  padding: 30 * $spacing-xs 14 * $spacing-xs;
}
</style>