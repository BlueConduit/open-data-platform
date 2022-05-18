<template>
  <div class="popup-content">
    <div class="title">{{ title }}</div>
    <div class="property-row" v-for="(key) in displayedProperties.keys()"
         :key="key">
      {{ key }}: {{ displayedProperties.get(key) }}
    </div>
  </div>
</template>

<script>
const FEATURE_PROPERTY_LABELS_KEYS_MAP = new Map(
    [['Lead & Copper Rule Violations', 'Lead and Copper Rule'],]);

/**
 * Map popup component.
 */
export default {
  name: "MapPopupContent.vue",
  data() {
    return {
      displayedProperties: new Map(),
    }
  },
  props: {
    title: {
      type: String,
    },
    properties: {
      type: Map,
    }
  },
  methods: {
    /**
     * Update displayed properties based on the properties passed in.
     *
     * Populates displayedProperties map with label and corresponding value read
     * from properties.
     */
    updateDisplayedProperties() {
      for (let entry of FEATURE_PROPERTY_LABELS_KEYS_MAP.entries()) {
        const label = entry[0];
        const featurePropertyKey = entry[1];

        this.displayedProperties.set(label,
            this.properties.get(featurePropertyKey));
      }
    }
  },
  mounted() {
    this.updateDisplayedProperties();
  },
  watch: {
    properties: function () {
      this.updateDisplayedProperties();
    },
  }
}
</script>

<style>

</style>