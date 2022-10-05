<template>
  <div class='section is-small has-text-centered'>
    <div class='columns is-centered'>
      <div class='column is-two-thirds'>
        <div class='header-section'>
          <div class='h1-header-large'>
            {{ messages.EXPLORE_MAP_SECTION_HEADER }}
          </div>
          <div class='h2-header-large centered-text'>
            {{ messages.EXPLORE_MAP_SECTION_SUBHEADER }}
          </div>
        </div>
      </div>
    </div>

    <div class='columns'>
      <div class='column'>
        <img class='static-map' alt=''
             src='../../assets/media/static-map.png' />
      </div>
    </div>

    <div class='columns'>
      <div class='column'>
        <button class='gold-button' @click='navigateToMap'>
          {{ messages.EXPLORE_MAP_BUTTON_TEXT }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { LandingPageMessages as messages } from '../../assets/messages/landing';
import { router } from '../../router';

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

.static-map {
  width: 100%;
  max-width: 1000px;
  border-radius: $spacing-md;
  box-shadow: $image-shadow;
}

.section {
  background-color: $light-gold-50;
  color: $warm-grey-900;
}

.gold-button {
  margin: $spacing-lg 0 $spacing-md 0;
}
</style>
