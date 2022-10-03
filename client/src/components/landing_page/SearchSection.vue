<template>
  <div class='section is-medium'>
    <div class='columns is-centered'>
      <div class='header column is-half'>
        <div class='header-section'>
          <div class='h1-header-xl'>
            {{ messages.SEARCH_SECTION_HEADER }}
          </div>
          <div class='h2-header-large mb-6'>{{ messages.SEARCH_SECTION_SUBHEADER
            }}
          </div>
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

.header {
  @include center-container;
}

.section {
  color: $white;

  background-image: url('~@/assets/media/landing-image-1.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

</style>
