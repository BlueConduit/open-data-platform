<template>
  <div class='popup-content'>
    <div class='title-container'>
      <h2>{{ title }}</h2>
      <div class='subtitle'>{{ subtitle }}</div>
    </div>
    <div class='details'>
      <div class='details-title'>{{ detailsTitle }}</div>
      <div class='property-row' v-for='(entry) in displayedProperties.entries()'
           :key='entry'>
        {{ entry[0] }}: {{ entry[1] }}
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { FeatureProperty, FeaturePropertyDataType } from '../model/data_layer';

const LESS_THAN_FIVE_PERCENT = '< 5%';
const GREATER_THAN_NINETY_FIVE_PERCENT = '> 95%';
/**
 * Map popup component.
 */
export default defineComponent({
  name: 'MapPopupContent',
  data() {
    return {
      displayedProperties: new Map<string, string>(),
    };
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    detailsTitle: {
      type: String,
      required: true,
    },
    featureProperties: {
      // There is no constructor function for an Array of declared type, so use
      // generic Array here and cast to PropType of a FeatureProperty[].
      // See https://vuejs.org/guide/typescript/options-api.html#typing-component-props.
      type: Array as PropType<FeatureProperty[]>,
      required: true,
    },
    properties: {
      type: Map as PropType<Map<string, string>>,
      required: true,
    },
  },
  methods: {
    /**
     * Update displayed properties based on the properties passed in.
     *
     * Populates displayedProperties map with label and corresponding value read
     * from properties.
     */
    updateDisplayedProperties(): void {
      this.displayedProperties.clear();

      for (let entry of this.featureProperties) {
        const featurePropertyKey = entry.name;
        const label = entry.label;
        let propertyValue = this.properties.get(featurePropertyKey);
        // Skip over optional properties which have no value.
        if (entry.optional && propertyValue == null) {
          continue;
        }
        switch (entry.dataType) {
          case FeaturePropertyDataType.String: {
            propertyValue = propertyValue ?? '';
            break;
          }
          case FeaturePropertyDataType.Number: {
            propertyValue = parseFloat(propertyValue ?? '0').toLocaleString();
            break;
          }
          case FeaturePropertyDataType.Percentage: {
            propertyValue = this.formatPercentage(parseFloat(propertyValue ?? '0') * 100);
            break;
          }
          default: {
            propertyValue = propertyValue ?? 'N/A';
            break;
          }
        }

        this.displayedProperties.set(label, propertyValue);
      }
    },

    /**
     * Formats string for a percentage value.
     */
    formatPercentage(percentageValue: number): string {
      if (percentageValue < 5) {
        return LESS_THAN_FIVE_PERCENT;
      } else if (percentageValue > 95) {
        return GREATER_THAN_NINETY_FIVE_PERCENT;
      } else {
        return `${percentageValue.toLocaleString()}%`;
      }
    },
  },
  mounted() {
    this.updateDisplayedProperties();
  },
  watch: {
    properties: function() {
      this.updateDisplayedProperties();
    },
  },
});
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