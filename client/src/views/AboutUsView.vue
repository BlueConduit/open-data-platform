<template>
  <div class='about-us'>
    <div class='text container-column'>
      <div class='h1-header-xl'>{{ messages.ABOUT_US_HEADER }}</div>
      <div class='h1-header'>
        {{ messages.BLUE_CONDUIT_INTRO_TEXT }}
        <p></p>
        {{ messages.BLUE_CONDUIT_IMPACT_TEXT }}
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
  text-align: start;
}

.text {
  gap: $spacing-lg;
  padding: $spacing-xl;
  max-width: 700px;
}
</style>