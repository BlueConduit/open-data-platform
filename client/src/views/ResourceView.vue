<template>
  <div class='content'>
    <filter-info-section />
    <filter-types-section />
    <recommendations-section />
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import FilterInfoSection from '../components/resources_page/FilterInfoSection.vue';
import FilterTypesSection from '../components/resources_page/FilterTypesSection.vue';
import RecommendationsSection from '../components/resources_page/RecommendationsSection.vue';

/**
 * Resources page component.
 */
export default defineComponent({
  name: 'ResourceView',
  components: {
    RecommendationsSection,
    FilterInfoSection,
    FilterTypesSection,
  },
});
</script>

<style scoped>
</style>
