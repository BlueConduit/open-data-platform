<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h1-header-large'>{{ messages.LSLR_HEADER }}</div>
      <div class='h2-header-large'>{{ messages.LSLR_SUBHEADER }}</div>
      <button class='gold-button'>{{ messages.LSLR_CTA_TEXT }}</button>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ScorecardMessages as messages } from '@/assets/messages/scorecard_messages';

/**
 * Lslr section component.
 */
export default defineComponent({
  name: 'LslrSection',
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

.section {
    background-color: $white;
    color: $warm-grey-800;
}
</style>