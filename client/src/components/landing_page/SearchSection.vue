<template>
  <div class='section is-large'>
    <div class='columns'>
      <div class='header column is-half'>
        <div class='h1-header-xl mb-6'>
          {{ messages.SEARCH_SECTION_HEADER }}
        </div>
        <div class='h1-header-large'>
          {{ messages.SEARCH_SECTION_SUBHEADER }}
        </div>
      </div>
      <div class='column is-half'>
        <ScorecardSearch
          :placeholder='messages.GEOLOCATE_PLACEHOLDER_TEXT'
          :ctaButtonText='messages.CHECK_LEAD_STATUS_BUTTON_TEXT'
        />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
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

<style scoped lang='scss'>
@import '../../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.h1-header-xl {
  font-size: 13.5 * $spacing-xs;
}

.h1-header-large {
  text-align: start;
}

.section {
  color: $white;

  background-image: url('~@/assets/media/landing-image-2.png'), url('~@/assets/media/landing-image-1.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

</style>
