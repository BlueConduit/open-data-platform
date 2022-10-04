<template>
  <div class='landing-page'>
    <SearchSection />
    <WhyLeadOutSection />
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

/**
 * This view displays a landing page with search.
 */
export default defineComponent({
  name: 'LandingPageView',
  components: {
    WhyLeadOutSection,
    EmailSignup,
    ExploreMapSection,
    SearchSection,
  },
});
</script>

<style scoped>
.landing-page {
  background-color: #0b2553;
  min-height: 100%;
}
</style>
