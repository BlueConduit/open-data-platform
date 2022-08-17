<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h2-header-large'>{{ messages.FilterInfo.SUPER_HEADER }}</div>
      <div class='h1-header-large'>{{ messages.FilterInfo.HEADER }}</div>
      <div class='h2-header-large'>{{ messages.FilterInfo.BODY }}</div>
    </div>
    <button class='grey-button' @click='goToResources'>
      {{ messages.FilterInfo.CTA_BUTTON }}
    </button>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import * as messages from '@/assets/messages/landing';
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
    goToResources(): void {
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
}

.section {
  padding: 14 * $spacing-xs 61 * $spacing-xs;
  background-color: $light-blue;
  color: $white;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12 * $spacing-xs;
}
</style>