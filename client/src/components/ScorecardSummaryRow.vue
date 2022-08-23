<template>
  <div
    :class='containerRowClass'
    :style='cssVars'>
    <div class='asset'><img :src='require(`@/assets/media/${image}`)' alt=''>
    </div>
    <div>
      <div class='h2-header'> {{ header }}</div>
      <div class='explain-text'> {{ subheader }}</div>
      <!--      TODO: Handle error state where there is no demographic data -->
      <!--      after the API has returned.-->
      <div v-if='comparisonValue != null'> {{ comparisonValue }}</div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';

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
  },
  data() {
    return {
      containerRowClass: this.imageFloatDirection == ImageFloatDirection.left
        ? 'center-container' : 'container-reverse',
    };
  },
  computed: {
    cssVars() {
      return {
        '--height': '225px',
      };
    },
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

.explain-text {
  color: white;
}

.asset img {
  height: var(--height);
  width: 18 * $spacing-md;
}

</style>