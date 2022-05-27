<template>
  <div class="map-overlay">
    <div>{{ this.title }}</div>
    <p></p>
    <div class="bucket"
         v-for="(bucket) in this.displayedBucketsMap.entries()" :key="bucket">
      <span class="color"
            :style="{'background-color': bucket[1]}"></span>
      <span> {{ bucket[0] }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

/**
 * Map legend component.
 *
 * Takes title and map of string keys -> hex string color values.
 */
export default defineComponent({
  name: 'MapLegend',
  data() {
    return {
      displayedBucketsMap: new Map<string, string>(),
    };
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    bucketMap: {
      // There is no constructor function for a Map of declared type, so use
      // generic Map here and cast to PropType of a Map<string, string>.
      // See https://vuejs.org/guide/typescript/options-api.html#typing-component-props.
      type: Map as PropType<Map<string, string>>,
      required: true,
    }
  },
  methods: {
    /**
     * If this is the last bucket, create label which is `currentKey+`.
     * Otherwise, create label which is the range `currentKey - nextKey`.
     */
    bucketLabel(bucket: string[], index: number, buckets: string[][]): string {
      return index < buckets.length - 1
          ? `${bucket[0]} - ${buckets[index + 1][0]}` : `${bucket[0]}+`;
    },

    /**
     * Create bucket labels and colors for legend.
     *
     * This is called when the component is mounted and any time the incoming
     * bucketMap is updated.
     */
    createLegend(): void {
      this.displayedBucketsMap.clear();
      const buckets: string[][] = Array.from(this.bucketMap.entries());

      buckets.forEach((bucket: string[], index: number): void => {
        const bucketLabel = this.bucketLabel(bucket, index, buckets);
        this.displayedBucketsMap.set(bucketLabel, bucket[1]);
      });
    },
  },
  mounted() {
    this.createLegend();
  },
  watch: {
    /**
     * Update legend if bucketMap changes.
     *
     * This could happen if the user toggles visual layers, which would change
     * the type and therefore buckets of the data we want to display.
     */
    bucketMap: function (): void {
      this.createLegend();
    },
  }
})
</script>

<style scoped>
.color {
  border-radius: 20%;
  width: 10px;
  height: 10px;
  margin-right: 5px;
}

.bucket {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.map-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #fff;
  margin-right: 20px;
  overflow: auto;
  border-radius: 3px;
  padding: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 20px;
}
</style>