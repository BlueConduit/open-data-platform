<template>
  <div class='scorecard-search'>
    <GeocoderInput class='geocoder'
                   :placeholder='this.placeholder'
                   :acceptedTypes='acceptedTypes'
                   @result='onGeocodeResults' />
    <button class='gold-button' @click='onSearch' :disabled='!searchHasResult'>
      {{ ctaButtonText }}
    </button>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { SCORECARD_BASE } from '../../router';
import GeocoderInput from '../GeocoderInput.vue';
import { GeoType } from '../../model/states/model/geo_data';

/**
 * A component for searching for a scorecard.
 */
export default defineComponent({
  name: 'ScorecardSearch',
  components: { GeocoderInput },
  props: {
    placeholder: {
      type: String,
      default: 'Search',
    },
    ctaButtonText: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      lat: 0,
      long: 0,
      geoType: GeoType.unknown,
      acceptedTypes: [GeoType.address, GeoType.postcode],
    };
  },
  computed: {
    searchHasResult(): boolean {
      return this.lat != 0 && this.long != 0;
    },
  },
  methods: {
    onGeocodeResults(lat: number, long: number, geoType: GeoType) {
      this.lat = lat;
      this.long = long;
      this.geoType = geoType;
    },
    onSearch() {
      this.$router.push(`${SCORECARD_BASE}/${this.geoType}/${this.lat},${this.long}`);
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.geocoder {
  height: $spacing-xl;
  width: 512px;
}

.scorecard-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-lg;
}
</style>
