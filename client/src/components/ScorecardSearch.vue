<template>
  <div class="scorecard-search">
    <h1>Get Your Drinking Water Score</h1>
    <p>See how your community has been impacted by lead service lines in your water system</p>
    <input />
    <button>Get Score</button>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';

/**
 * A component for searching for a scorecard.
 */
export default defineComponent({
  name: 'ScorecardSearch',
});
</script>

<style scoped>  
  .scorecard-search{
    text-align: center;
    vertical-align: middle;
  }
</style>