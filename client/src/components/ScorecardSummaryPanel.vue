<template>
  <div class='container-wrapper'>
    <div class='container-column'>
      <div class='semi-bold h1-header'>
        <div> {{ PredictionMessages.SCORECARD_SUMMARY_PANEL_HEADER }}</div>
      </div>
      <div> {{ PredictionMessages.SCORECARD_SUMMARY_PANEL_SUBHEADER }}</div>
      <div class='container-column'>
        <!-- TODO(breuch): Move prediction factors into model -->
        <ScorecardSummaryRow
          :header='PredictionMessages.HOME_AGE'
          :subheader='PredictionMessages.HOME_AGE_EXPLAINED'
          comparisonValue='10% lower' />
        <ScorecardSummaryRow
          :header='PredictionMessages.SOCIAL_VULNERABILITY_INDEX'
          :subheader='PredictionMessages.SOCIAL_VULNERABILITY_INDEX_EXPLAINED'
          :image-float-direction='ImageFloatDirection.right'
          comparisonValue='3% higher' />
        <ScorecardSummaryRow
          :header='PredictionMessages.INCOME_LEVEL'
          :subheader='PredictionMessages.INCOME_LEVEL_EXPLAINED'
          comparisonValue='15% lower' />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ScorecardSummaryMessages } from '../assets/messages/scorecard_summary_messages';
import ScorecardSummaryRow, { ImageFloatDirection } from './ScorecardSummaryRow.vue';

/**
 * Prediction explanation.
 */
export default defineComponent({
  name: 'ScorecardSummaryPanel',
  components: {
    ScorecardSummaryRow,
  },
  data() {
    return {
      PredictionMessages: ScorecardSummaryMessages,
      ImageFloatDirection,
    };
  },
});
</script>

<style scoped>

.container-wrapper {
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%
}

.container-column {
  align-items: center;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  padding: 20px;
}
</style>