<template>
  <div class='about-us columns'>
    <div class='text container-column column is-two-thirds'>
      <div class='h1-header-xl'>{{ messages.ABOUT_US_HEADER }}</div>
      <div class='h1-header container-column'>
        <div>{{ messages.BLUE_CONDUIT_INTRO_TEXT }}</div>
        <div>{{ messages.BLUE_CONDUIT_IMPACT_TEXT }}</div>
        <div class='cta'>
          <span>{{ messages.LEARN_RISK_STATUS_CTA_PROMPT }}</span>
          <router-link :to='HOME_ROUTE'>
            {{ messages.LEARN_RISK_STATUS_CTA_TEXT }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { AboutUsMessages as messages } from '../assets/messages/about_us_messages';
import { HOME_ROUTE } from '../router';

/**
 * About Us page component.
 */
export default defineComponent({
  name: 'AboutUsView',
  data() {
    return {
      messages,
      HOME_ROUTE,
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
  //max-width: 700px;
}

.h1-header {
  gap: $spacing-md;
}
</style>