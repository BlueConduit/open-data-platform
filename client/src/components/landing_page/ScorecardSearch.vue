<template>
  <div class='scorecard-search'>
    <div class='header-section'>
      <div class='h1-header-xl'>{{ messages.FIND_RISK_STATUS_HEADER }}</div>
      <div class='h2-header'>{{ messages.FIND_RISK_STATUS_BODY }}</div>
    </div>
    <GeocoderInput
      class='geocoder'
      :placeholder='messages.GEOLOCATE_PLACEHOLDER_TEXT'
      :acceptedTypes='acceptedTypes'
      @result='onGeocodeResults'
    />
    <button
      class='gold-button'
      id='scorecard-search-button'
      @click='onSearch'
      :disabled='!searchHasResult'
    >
      {{ messages.CHECK_LEAD_STATUS_BUTTON_TEXT }}
    </button>
    <div>
      {{ messages.FIND_RISK_STATUS_FOOTER }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { SCORECARD_BASE } from '../../router';
import GeocoderInput from '../GeocoderInput.vue';
import { GeoType } from '../../model/states/model/geo_data';
import { LandingPageMessages } from '../../assets/messages/landing';

/**
 * A component for searching for a scorecard.
 */
export default defineComponent({
  name: 'ScorecardSearch',
  components: { GeocoderInput },
  data() {
    return {
      lat: 0,
      long: 0,
      geoType: GeoType.unknown,
      acceptedTypes: [GeoType.address, GeoType.postcode],
      messages: LandingPageMessages,
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

<style scoped lang="scss">
@import '../../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.geocoder {
  height: $spacing-xl;
  width: 100%;
  border: 1px solid $warm-grey-700;
  border-radius: $spacing-xs;
}

.scorecard-search {
  @include center-container;
  flex-direction: column;
  gap: $spacing-lg;
  padding: $spacing-lg;
  background-color: $white;
  color: $warm-grey-800;
}
</style>
