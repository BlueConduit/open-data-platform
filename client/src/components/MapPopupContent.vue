<template>
  <div class="popup-content">
    <div class="title-container">
      <h2>{{ title }}</h2>
      <div class="subtitle">{{ subtitle }}</div>
    </div>
    <div class="details">
      <div class="details-title">{{ detailsTitle }}</div>
      <div class="property-row" v-for="(entry) in displayedProperties.entries()"
           :key="entry">
        {{ entry[0] }}: {{ entry[1] }}
      </div>
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
  // TODO(kaila): remove default when content is finalized.
  props: {
    title: {
      type: String,
      default: function () {
        return 'County';
      }
    },
    subtitle: {
      type: String,
      default: function () {
        return '320 estimated lead service lines';
      }
    },
    detailsTitle: {
      type: String,
      default: function () {
        return 'Lead & Copper Rule Violations';
      }
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
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap");

.details {
  padding-top: 20px;
  font-size: 14px;
}

.details-title {
  font-weight: 600;
}

/* Override Mapbox Popup font. */
.popup-content {
  font-family: "IBM Plex Sans", sans-serif;
}

.subtitle {
  font-size: 14px;
}

.title-container {
  width: 222px;
  height: 70px;
  border-bottom: 1px solid #E5E5E5;
}
</style>