<template>
  <div class=''>
    <div class='why-leadout-section columns is-gapless'>
      <div class='column is-one-third is-hidden-mobile'>
        <img class='image' alt=''
             src='../../assets/media/landing-image-3.png' />
      </div>
      <div class='column why-leadout'>
        <div class='header-section'>
          <div class='h1-header-xl'>{{ messages.WHY_LEADOUT_HEADER }}</div>
          <div class='h1-header'>{{ messages.WHY_LEADOUT_SUBHEADER }}</div>
          <div class='h2-header-large'>{{ messages.WHY_LEADOUT_BODY }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { LandingPageMessages } from '../../assets/messages/landing';

export default defineComponent({
  name: 'WhyLeadOutSection',
  data() {
    return {
      messages: LandingPageMessages,
    };
  },
});
</script>

<style scoped lang='scss'>
@import '../../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.image {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.why-leadout {
  color: $white;
  background-color: $teal;
  @include center-container;
}

.why-leadout-section {
  max-height: 1000px;
}

.header-section {
  padding: $spacing-lg;
  align-items: flex-start;
  gap: $spacing-lg;
}
</style>