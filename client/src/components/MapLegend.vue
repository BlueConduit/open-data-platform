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
import { defineComponent, inject } from 'vue';
import { State } from '../model/state';
import { stateKey } from '../injection_keys';

/**
 * Map legend component.
 *
 * Takes title and map of string keys -> hex string color values.
 */
export default defineComponent({
  name: 'MapLegend',
  setup() {
    const state: State = inject(stateKey, State.default());

    return {
      state,
    };
  },
  data() {
    return {
      title: '',
      displayedBucketsMap: new Map<string, string>(),
    };
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
      this.title = this.state.currentDataLayer?.legendInfo?.title ?? '';
      this.displayedBucketsMap.clear();

      const bucketEntries = this.state.currentDataLayer?.legendInfo.bucketMap?.entries();

      if (bucketEntries != null) {
        const buckets: string[][] = Array.from(bucketEntries);

        buckets.forEach((bucket: string[], index: number): void => {
          const bucketLabel = this.bucketLabel(bucket, index, buckets);
          this.displayedBucketsMap.set(bucketLabel, bucket[1]);
        });
      }
    },
  },
  mounted() {
    this.createLegend();
  },
  watch: {
    /**
     * Update legend with current data layer options when state is updated.
     *
     * This could happen if the user toggles visual layers, which would change
     * the type and therefore buckets of the data we want to display.
     */
    state: {
      handler(newState: State): void {
        if (newState.currentDataLayer != null) {
          this.createLegend();
        }
      },
      // Make watcher deep, meaning that this will be triggered on a change to any nested field of state.
      deep: true,
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