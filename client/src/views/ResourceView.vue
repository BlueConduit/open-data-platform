<template>
  <div class='content'>
    <filter-info-section />
    <filter-types-section />
    <recommendations-section />
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ResourcesPageMessages as messages } from '../assets/messages/resources';
import { ResourcesPageStyles as styles } from '../assets/styles/resources';
import FilterInfoSection from '../components/resources_page/FilterInfoSection.vue';
import FilterTypesSection from '../components/resources_page/FilterTypesSection.vue';
import RecommendationsSection from '../components/resources_page/RecommendationsSection.vue';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'ResourceView',
  components: {
    RecommendationsSection,
    FilterInfoSection,
    FilterTypesSection,
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
.content {
  margin-top: 109px;
}
</style>
