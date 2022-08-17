<template>
  <LandingPageSection class='section'
                      :messages='messages.FilterInfo'
                      :styles='styles.FILTER_SECTION_STYLE'>
    <button class='learn-more-button' @click='goToResources'>
      {{ messages.FilterInfo.CTA_BUTTON }}
    </button>
  </LandingPageSection>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import * as messages from '@/assets/messages/landing';
import { LandingPageStyles as styles } from '@/assets/styles/style_props';
import LandingPageSection from '@/components/landing_page/LandingPageSection.vue';
import { router } from '@/router';

/**
 * Content for filter info section of the landing page.
 */
export default defineComponent({
  name: 'FilterInfoSection',
  components: {
    LandingPageSection,
  },
  data() {
    return {
      messages,
      styles,
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

<style scoped>
.learn-more-button {
  width: fit-content;
  font-size: 18px;
  font-weight: 500;
  line-height: 65px;
  text-align: center;
  color: #464646;
  border-radius: 16px;
  border: 1px solid #A3A3A3;
  padding: 0 19px;
}

.section {
  padding: 53px 241px;
}
</style>