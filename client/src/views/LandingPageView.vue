<template>
  <ScorecardSearch />
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import ScorecardSearch from '@/components/ScorecardSearch.vue'

/**
 * This view displays a landing page with search.
 */
export default defineComponent({
  name: 'LandingPageView',
  components: {
    ScorecardSearch,
  }
});
</script>

<style scoped>

</style>