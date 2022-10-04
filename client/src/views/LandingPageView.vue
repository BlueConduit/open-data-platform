<template>
  <div class='landing-page'>
    <SearchSection />
    <WhyLeadOutSection />
    <UnderstandingLslSection />
    <ExploreMapSection />
    <EmailSignup />
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import SearchSection from '../components/landing_page/SearchSection.vue';
import ExploreMapSection from '../components/landing_page/ExploreMapSection.vue';
import EmailSignup from '../components/EmailSignup.vue';
import WhyLeadOutSection from '../components/landing_page/WhyLeadOutSection.vue';
import UnderstandingLslSection from '../components/landing_page/UnderstandingLslSection.vue';

/**
 * This view displays a landing page with search.
 */
export default defineComponent({
  name: 'LandingPageView',
  components: {
    EmailSignup,
    ExploreMapSection,
    SearchSection,
    UnderstandingLslSection,
    WhyLeadOutSection,
  },
});
</script>

<style scoped>
.landing-page {
  background-color: #0b2553;
  min-height: 100%;
}
</style>
