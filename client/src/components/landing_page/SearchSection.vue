<template>
  <div class='search-section'>
    <LandingPageSection class='search-landing-page-section'
                        :messages='messages.ScorecardSearch'
                        :styles='styles.SEARCH_SECTION_STYLE'>
      <ScorecardSearch :messages='messages.ScorecardSearch' />
    </LandingPageSection>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import * as messages from '@/assets/messages/landing';
import LandingPageSection from './LandingPageSection.vue';
import ScorecardSearch from './ScorecardSearch.vue';
import { LandingPageStyles as styles } from '@/assets/styles/style_props';

/**
 * Content for the address search section of the landing page.
 */
export default defineComponent({
  name: 'SearchSection',
  components: {
    LandingPageSection,
    ScorecardSearch,
  },
  data() {
    return {
      messages,
      styles,
    };
  },
});
</script>

<style scoped>
.search-section {
  background-image: url('~@/assets/media/landing-image-2.png'), url('~@/assets/media/landing-image-1.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center, center;
  height: 803px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.search-landing-page-section {
  background: none;
  width: 974px;
  height: 358px;
}
</style>