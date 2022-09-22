<template>
  <div class=''>
    <div class='h2-header-large'>{{ header }}</div>
    <div class='explain-text'>
      {{ subheader }} <br />
      <a v-if='learnMoreLink != null' :href='learnMoreLink'>
        {{ ScorecardMessages.LEARN_MORE }}</a>
    </div>
    <div v-if='comparisonValue != null' class='comparison-value'>
      {{ comparisonValue }}
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { ScorecardMessages } from '../../assets/messages/scorecard_messages';

/**
 * A single row for a scorecard summary.
 */
export default defineComponent({
  name: 'ScorecardSummaryRow',
  props: {
    comparisonValue: String,
    header: String,
    subheader: String,
    learnMoreLink: String,
  },
  data() {
    return {
      ScorecardMessages,
    };
  },
});
</script>
<style scoped lang='scss'>
@import 'src/assets/styles/global';
@import '@blueconduit/copper/scss/01_settings/design-tokens';
@import 'bulma/sass/grid/columns';
@import 'bulma/sass/helpers/typography';

a {
  color: $text_white;
}

.comparison-value {
  color: $text_white;
  font-weight: 600;
}

.explain-text {
  color: $text_white;
  text-align: center;
}
</style>
