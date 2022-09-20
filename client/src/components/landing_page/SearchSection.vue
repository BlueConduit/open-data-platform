<template>
  <div class='section is-large has-text-centered'>
    <div class='columns is-centered'>
      <div class='column is-half'>
        <div class='header-section'>
          <div class='h1-header-xl'>{{ messages.SEARCH_SECTION_HEADER }}</div>
          <div class='h2-header-large mb-6'>{{ messages.SEARCH_SECTION_SUBHEADER }}</div>
        </div>
        <ScorecardSearch
          :placeholder='messages.GEOLOCATE_PLACEHOLDER_TEXT'
          :ctaButtonText='messages.CHECK_LEAD_STATUS_BUTTON_TEXT'
        />
        <div class='h2-header mt-6'>{{ messages.SEARCH_SECTION_FOOTER }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { LandingPageMessages as messages } from '../../assets/messages/landing';
import ScorecardSearch from './ScorecardSearch.vue';

/**
 * Content for the address search section of the landing page.
 */
export default defineComponent({
  name: 'SearchSection',
  components: {
    ScorecardSearch,
  },
  data() {
    return {
      messages,
    };
  },
});
</script>

<style scoped lang="scss">
@import '../../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';
@import 'bulma/sass/layout/section.sass';
@import 'bulma/sass/grid/columns.sass';
@import 'bulma/sass/helpers/typography.sass';
@import 'bulma/sass/helpers/spacing.sass';

.section {
  color: $white;

  // Use a semi-opaque gradient to tint the background image for better text readability.
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url('~@/assets/media/landing-image-2.png'), url('~@/assets/media/landing-image-1.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center, center;
}

.h2-header-large {
  margin-bottom: $spacing-lg;
}
</style>
