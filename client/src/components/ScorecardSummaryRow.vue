<template>
  <div
    :class='containerRowClass'>
    <div class='asset'><img :src='require(`@/assets/media/${image}`)' alt=''>
    </div>
    <div class='factor-text'>
      <div class='h2-header-large'> {{ header }}</div>
      <div class='explain-text'> {{ subheader }} <br>
        <a v-if='learnMoreLink != null' :href='learnMoreLink'>
          {{ ScorecardMessages.LEARN_MORE }}</a>
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
import { ScorecardMessages } from '../assets/messages/scorecard_messages';

/**
 * Which side of the summary row to place the image.
 */
export enum ImageFloatDirection {
  left,
  right
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
      containerRowClass: this.imageFloatDirection == ImageFloatDirection.left
        ? 'center-container' : 'container-reverse',
      ScorecardMessages,
    };
  },
});


</script>
<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.center-container {
  height: var(--height);
  gap: $spacing-lg;
}

.container-reverse {
  @include center-container;

  flex-direction: row-reverse;
}

.comparison-value {
  color: $warm-grey-800;
  font-weight: 600;
}

.explain-text {
  color: white;
}

.factor-text {
  @include container-column;
  gap: $spacing-md;
}

.asset img {
  width: 20 * $spacing-md;
}

</style>