<template>
  <div class="scorecard-search">
    <h1>Get Your Drinking Water Score</h1>
    <p>Understand the likelihood of your home or community's exposure to lead service lines</p>
    <!-- TODO: add ZIP, city, state as they are supported. -->
    <input placeholder="Enter your address" />
    <button>Get Score</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/**
 * A component for searching for a scorecard.
 */
export default defineComponent({
  name: 'ScorecardSearch',
});
</script>

<style scoped>
.scorecard-search {
  text-align: center;
  vertical-align: middle;
}
</style>
