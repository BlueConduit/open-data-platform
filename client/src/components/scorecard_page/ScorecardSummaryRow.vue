<template>
  <div class='columns is-centered' :class='{ reverse }'>
    <div class='column asset has-text-centered'>
      <img :src='require(`@/assets/media/${image}`)' alt='' />
    </div>
    <div class='column'>
      <div class='h2-header-large'>{{ header }}</div>
      <div class='explain-text'>
        {{ subheader }} <br />
        <a v-if='learnMoreLink != null' :href='learnMoreLink'>
          {{ ScorecardMessages.LEARN_MORE }}</a
        >
      </div>
      <!--      TODO: Handle error state where there is no demographic data -->
      <!--      after the API has returned.-->
      <div v-if='comparisonValue != null' class='comparison-value'>
        {{ comparisonValue }}
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { ScorecardMessages } from '../../assets/messages/scorecard_messages';

/**
 * Which side of the summary row to place the image.
 */
export enum ImageFloatDirection {
  left,
  right,
}

/**
 * A single row for a scorecard summary.
 */
export default defineComponent({
  name: 'ScorecardSummaryRow',
  props: {
    comparisonValue: String,
    header: String,
    image: { type: String, default: 'placeholder_image.png' },
    imageFloatDirection: {
      type: Number as PropType<ImageFloatDirection>,
      default: ImageFloatDirection.left,
    },
    subheader: String,
    learnMoreLink: String,
  },
  data() {
    return {
      reverse: this.imageFloatDirection == ImageFloatDirection.right,
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

.reverse {
  flex-direction: row-reverse;
}

.comparison-value {
  color: $text_white;
  font-weight: 600;
}

.explain-text {
  color: $text_white;
  width: 100%;
}

.asset img {
  width: 20 * $spacing-md;
}
</style>
