<template>
  <div class='search-section'>
    <div class='header-section'>
      <div class='h1-header-xl'>{{ messages.SEARCH_SECTION_HEADER }}</div>
      <div class='h2-header-large'>{{ messages.SEARCH_SECTION_SUBHEADER }}</div>
    </div>
    <ScorecardSearch :placeholder='messages.GEOLOCATE_PLACEHOLDER_TEXT'
                     :cta-button-text='messages.CHECK_LEAD_STATUS_BUTTON_TEXT' />
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

.h2-header-large {
  max-width: 46 * $spacing-md;
  text-align: center;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
}

.search-section {
  background-image: url('~@/assets/media/landing-image-2.png'), url('~@/assets/media/landing-image-1.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center, center;
  height: 201 * $spacing-xs;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12 * $spacing-xs;

  color: $white;
}
</style>