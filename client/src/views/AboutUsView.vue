<template>
  <div class='about-us columns'>
    <div class='text container-column column is-two-thirds'>
      <div class='h1-header-xl'>{{ aboutUsContent.title }}</div>
      <div class='container-column' v-html='aboutUsContent.content'></div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { aboutUsContent } from '../assets/messages/about_us_messages';

/**
 * About Us page component.
 */
export default defineComponent({
  name: 'AboutUsView',
  data() {
    return {
      aboutUsContent,
    };
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.about-us {
  min-height: 100%;
  background-color: $light-blue-800;
  background-image: url('~@/assets/media/about-us-image.png');
  background-size: cover;
  background-repeat: no-repeat;
  color: $white;
}

.cta {
  @include container-row;
}

.text {
  gap: $spacing-lg;
  padding: $spacing-xl;
}

.h1-header {
  gap: $spacing-md;
}
</style>