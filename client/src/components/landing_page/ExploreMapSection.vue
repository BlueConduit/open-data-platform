<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h1-header-large'>
        {{ messages.EXPLORE_MAP_SECTION_HEADER }}
      </div>
      <div class='h2-header-large'>
        {{ messages.EXPLORE_MAP_SECTION_SUBHEADER }}
      </div>
    </div>
    <img class='static-map'
         alt=''
         :src='require(`@/assets/media/static-map.png`)'>
    <button class='gold-button' @click='navigateToMap'>
      {{ messages.EXPLORE_MAP_BUTTON_TEXT }}
    </button>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { LandingPageMessages as messages } from '@/assets/messages/landing';
import { router } from '@/router';

/**
 * Content for 'Explore map' section of the landing page.
 */
export default defineComponent({
  name: 'ExploreMapSection',
  data() {
    return {
      messages,
    };
  },
  methods: {
    navigateToMap(): void {
      router.push({
        path: '/map',
      });
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.h2-header-large {
  max-width: 70%;
}

.static-map {
  max-width: 1000px;
  border-radius: $spacing-md;
  box-shadow: $image-shadow;
}

.section {
  background-color: $white;
  color: $warm-grey-800;
}
</style>