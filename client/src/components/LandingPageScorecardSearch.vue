<template>
  <div class="scorecard-search">
    <h1>{{ messages.HEADER }}</h1>
    <p>{{ messages.BODY }}</p>
    <!-- TODO: add ZIP, city, state as they are supported. -->
    <input :placeholder="messages.CTA_PLACEHOLDER" />
    <button>{{ messages.CTA_BUTTON }}</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ScorecardSearch } from '../assets/messages/landing';

/**
 * A component for searching for a scorecard.
 */
export default defineComponent({
  name: 'LandingPageScorecardSearch',
  data() {
    return {
      messages: ScorecardSearch,
    };
  },
});
</script>

<style scoped>
.scorecard-search {
  text-align: center;
  vertical-align: middle;
}
</style>
