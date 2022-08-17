<template>
  <div class='scorecard-search'>
    <GeocoderInput class='geocoder'
                   :placeholder='this.messages.CTA_PLACEHOLDER'
                   @result='onGeocodeResults' />
    <button @click='onSearch' :disabled='!searchHasResult'>
      {{ messages.CTA_BUTTON }}
    </button>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { SCORECARD_BASE } from '../../router';
import { Messages } from './LandingPageSection.vue';
import GeocoderInput from '../GeocoderInput.vue';

/**
 * A component for searching for a scorecard.
 */
export default defineComponent({
  name: 'ScorecardSearch',
  components: { GeocoderInput },
  props: {
    messages: {
      type: Object as PropType<Messages>,
      required: true,
    },
  },
  data() {
    return {
      lat: 0,
      long: 0,
    };
  },
  computed: {
    searchHasResult(): boolean {
      return this.lat != 0 && this.long != 0;
    },
  },
  methods: {
    onGeocodeResults(lat: number, long: number) {
      this.lat = lat;
      this.long = long;
    },
    onSearch() {
      this.$router.push(`${SCORECARD_BASE}/${this.lat},${this.long}`);
    },
  },
});
</script>

<style scoped>
button {
  width: fit-content;
  height: 65px;
  padding: 0 19px;
  border-radius: 16px;
  background-color: #FFC300;
  border: 0;
  font-size: 18px;
}

.geocoder {
  height: 65px;
  width: 587px;
}

.scorecard-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
</style>
