<template>
  <div class='map-overlay' :style='style'>
    <div class='h2-header-large'>{{ this.title }}</div>
    <div class='explain-text'>{{ this.subheader }}</div>
    <p></p>
    <div class='bucket'
         v-for='(bucket) in this.displayedBuckets' :key='bucket'>
      <span class='color'
            :style='{&apos;background-color&apos;: bucket.bucketColor}'></span>
      <span class='explain-text'> {{ bucket.bucketLabel }}</span>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { LegendBucketData } from '../model/data_layer';
import { formatLegendBucket, getLegendForZoomLevel } from '../util/data_layer_util';
import { useSelector } from '../model/store';
import { MapDataState } from '../model/states/map_data_state';
import { ALL_DATA_LAYERS } from '../model/slices/map_data_slice';
import { MapData } from '../model/states/model/map_data';

/**
 * Map legend component.
 * Takes title and map of string keys -> hex string color values.
 */
export default defineComponent({
  name: 'MapLegend',
  setup() {
    const mapState = useSelector((state) => state.mapData) as MapDataState;

    return {
      mapState,
    };
  },
  data() {
    return {
      title: '',
      subheader: '',
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
      if (this.mapState?.mapData?.currentDataLayerId == null || this.mapState?.mapData?.zoom == null ) {
        return;
      }

      const layerToUse = Array.from(ALL_DATA_LAYERS.values()).find(l => l.id == this.mapState?.mapData?.currentDataLayerId);
      const legendInfo = getLegendForZoomLevel(Math.floor(this.mapState.mapData.zoom), layerToUse?.legendInfo);
      this.title = legendInfo?.title ?? '';
      this.subheader = legendInfo?.subheader ?? '';
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
    'mapState.mapData': {
      handler(mapData: MapData): void {
        if (mapData?.currentDataLayerId != null) {
          this.createLegend();
        }
      },
      // Make watcher deep, meaning that this will be triggered on a change to
      // any nested field of map data (like zoom and data layer).
      deep: true,
    },
  },
  props: {
    // Allows parent to determine styling for this component.
    style: [String, Object]
  }
});
</script>

<style scoped lang='scss'>
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.color {
  width: 50px;
  height: 10px;
  margin-right: $spacing-md;
}

.bucket {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.map-overlay {
  height: 250px;
  background: #fff;
  overflow: auto;
  border-radius: 3px;
  padding: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 20px;
  width: 300px;
}
</style>