<template>
  <div class='map-overlay' :style='style'>
    <div>{{ this.title }}</div>
    <p></p>
    <div class='bucket'
         v-for='(bucket) in this.displayedBuckets' :key='bucket'>
      <span class='color'
            :style='{&apos;background-color&apos;: bucket.bucketColor}'></span>
      <span> {{ bucket.bucketLabel }}</span>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, inject } from 'vue';
import { State } from '../model/state';
import { stateKey } from '../injection_keys';
import { LegendBucketData } from '../model/data_layer';
import { formatLegendBucket, getLegendForZoomLevel } from '../util/data_layer_util';

/**
 * Map legend component.
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
      displayedBuckets: new Array<LegendBucketData>(),
    };
  },
  methods: {
    /**
     * Create bucket labels and colors for legend.
     *
     * This is called when the component is mounted and any time the incoming
     * bucketMap is updated.
     */
    createLegend(): void {
      if (this.state.map == null || this.state.currentDataLayer == null) {
        return;
      }

      const legendInfo = getLegendForZoomLevel(this.state.currentDataLayer.legendInfo, Math.floor(this.state.map.getZoom()));
      this.title = legendInfo?.title ?? '';
      this.displayedBuckets = formatLegendBucket(legendInfo);
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
  },
  props: {
    // Allows parent to determine styling for this component.
    style: [String, Object]
  }
});
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
  height: 225px;
  background: #fff;
  overflow: auto;
  border-radius: 3px;
  padding: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 20px;
  width: 100px;
}
</style>