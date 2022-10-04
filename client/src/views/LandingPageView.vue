<template>
  <div class='landing-page'>
    <SearchSection />
    <WhyLeadOutSection />
    <ExploreMapSection />
    <FilterInfoSection />
    <ResourcesSection />
    <EmailSignup />
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import SearchSection from '../components/landing_page/SearchSection.vue';
import ExploreMapSection from '../components/landing_page/ExploreMapSection.vue';
import FilterInfoSection from '../components/landing_page/FilterInfoSection.vue';
import ResourcesSection from '../components/landing_page/ResourcesSection.vue';
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
    FilterInfoSection,
    ResourcesSection,
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
