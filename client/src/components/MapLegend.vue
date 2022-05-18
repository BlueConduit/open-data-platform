<template>
  <div class="map-overlay" id="legend">
    <div class="legend-title">{{ this.title }}</div>
    <p></p>
    <div class="legend-entry" v-for="(item, index) in bucketLabels" :key="item">
      <span class="color"
            :style="{'background-color': bucketColors[index]}"></span>
      <span class="label"> {{ bucketLabels[index] }}</span>
    </div>
  </div>
</template>

<script>
/**
 * Map legend component.
 *
 * Takes title and map of string keys -> hex string color values.
 */
export default {
  name: "MapLegend",
  data() {
    return {
      bucketLabels: [],
      bucketColors: [],
    }
  },
  props: {
    title: {type: String, required: true},
    bucketKeyValueMap: {type: Object, required: true},
  },
  methods: {
    /**
     * Create bucket labels and colors for legend.
     *
     * This is called when the component is mounted and any time the incoming
     * bucketKeyValueMap is updated.
     */
    createLegend() {
      const legendKeys = Object.keys(this.bucketKeyValueMap);
      const legendValues = Object.values(this.bucketKeyValueMap);

      legendKeys.forEach((legendKey, i) => {
        // If this is the last legendKey, create label which is `legendKey+`.
        // Otherwise, create label which is the range `currentKey - nextKey`.
        this.bucketLabels.push(
            i < legendKeys.length - 1
                ? `${legendKey} - ${legendKeys[i + 1]}` : `${legendKey}+`);
        this.bucketColors.push(legendValues[i]);
      });
    }
  },
  mounted() {
    this.createLegend();
  },
  watch: {
    // When map is updated, rebuild legend.
    bucketKeyValueMap: function () {
      this.createLegend();
    },
  }
}
</script>

<style scoped>
.color {
  border-radius: 20%;
  width: 10px;
  height: 10px;
  margin-right: 5px;
}

#legend {
  padding: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 20px;
}

.legend-entry {
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
}
</style>