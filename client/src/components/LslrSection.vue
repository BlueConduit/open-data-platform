<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h1-header-large'>{{ messages.LSLR_HEADER }}</div>
      <div class='h2-header-large'>{{ messages.LSLR_SUBHEADER }}</div>
      <button class='gold-button'>{{ messages.LSLR_CTA_TEXT }}</button>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { ScorecardMessages as messages } from '@/assets/messages/scorecard_messages';
import { City } from '@/model/states/model/geo_data';
import { GeoDataState } from '@/model/states/geo_data_state';
import { useSelector } from '@/model/store';

const LSLR_CITY_LINKS = {
    toledo : 'https://toledo.oh.gov/residents/water/lead-service-lines/customer-side',
}

/**
 * Lslr section component.
 */
export default defineComponent({
  name: 'LslrSection',
  props: {
    city: Object as PropType<City>,
  },
  data() {
    return {
      messages,
    };
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.section {
    background-color: $white;
    color: $warm-grey-800;
}
</style>