<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h1-header-large'>{{ messages.LSLR_HEADER }}</div>
      <div class='h2-header-large'>{{ messages.LSLR_SUBHEADER }}</div>
      <button class='gold-button'>
        <a :href='cityLink' target='_blank' rel='noopener noreferrer'>
        {{ messages.LSLR_CTA_TEXT }}
        </a>
      </button>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { ScorecardMessages as messages } from '@/assets/messages/scorecard_messages';
import { City } from '@/model/states/model/geo_data';

export const LSLR_CITY_LINKS = {
    toledo : 'https://toledo.oh.gov/residents/water/lead-service-lines/customer-side',
}

/**
 * Lslr section component.
 */
export default defineComponent({
  name: 'LslrSection',
  props: {
    city: {
      type: Object as PropType<City>,
      required: true,
    }
  },
  computed: {
    cityLink(): string {
      return LSLR_CITY_LINKS[this.city];
    }
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

a {
  text-decoration: none;
  color: $text-dark;
}

.section {
    background-color: $white;
    color: $warm-grey-800;
}
</style>