<template>
  <div
    :class='containerRowClass'>
    <div class='asset'><img :src='require(`@/assets/media/${image}`)' alt=''>
    </div>
    <div>
      <div class='semi-bold h2-header'> {{ header }}</div>
      <div class='explain-text'> {{ subheader }}</div>
      <div> {{ comparisonValue }}</div>
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
        ? 'container-row' : 'container-row container-reverse',
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

<style scoped>

.container-row {
  align-items: center;
  display: flex;
  height: var(--height);
  gap: 20px;
}

.container-reverse {
  flex-direction: row-reverse;
}

.asset img {
  height: var(--height);
  width: 300px;
}

</style>