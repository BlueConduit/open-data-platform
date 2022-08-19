<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h2-header-large'>
        {{ messages.CHOOSING_FILTER_SECTION_SUPER_HEADER }}
      </div>
      <div class='h1-header-large'>
        {{ messages.CHOOSING_FILTER_SECTION_HEADER }}
      </div>
      <div class='h2-header-large'>
        {{ messages.CHOOSING_FILTER_SECTION_SUBHEADER }}
      </div>
    </div>
    <button class='grey-button' @click='navigateToResources'>
      {{ messages.LEARN_MORE_BUTTON_TEXT }}
    </button>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { LandingPageMessages as messages } from '@/assets/messages/landing';
import { router } from '@/router';

/**
 * Content for filter info section of the landing page.
 */
export default defineComponent({
  name: 'FilterInfoSection',
  data() {
    return {
      messages,
    };
  },
  methods: {
    navigateToResources(): void {
      router.push({
        path: '/resources',
      });
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.h2-header-large {
  max-width: 34 * $spacing-md;
  text-align: center;
}

.header-section {
  @include container-column;
  @include center-container;
  gap: $spacing-md;
}

.section {
  @include container-column;
  @include center-container;
  padding: 14 * $spacing-xs 61 * $spacing-xs;
  background-color: $light-blue;
  color: $white;
  gap: 12 * $spacing-xs;
}
</style>