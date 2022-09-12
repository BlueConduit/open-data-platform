<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h1-header-large'>{{ messages.LSLR_HEADER }}</div>
      <div class='h2-header-large'>{{ messages.LSLR_SUBHEADER }}</div>
      <button class='gold-button'>
        <a :href='cityLink' target='_blank' rel='noopener noreferrer'>
          Go to city of {{ city }} website
        </a>
      </button>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { ScorecardMessages as messages } from '@/assets/messages/scorecard_messages';
import { City } from '@/model/states/model/geo_data';

export const LSLR_CITY_LINKS: Map<City, string> = new Map<City, string>([
  [City.newOrleans, 'https://www.swbno.org/DrinkingWater/LeadAwareness'],
  [City.richmond, 'https://www.rva.gov/public-utilities/water-utility#collapse-accordion-10788-3'],
  [City.toledo, 'https://toledo.oh.gov/residents/water/lead-service-lines/customer-side'],
]);

/**
 * Lead service line replacement (LSLR) section component.
 *
 * Contains city-specific LSLR program information.
 */
export default defineComponent({
  name: 'LslrSection',
  props: {
    city: {
      type: String as PropType<City>,
      required: true,
    },
  },
  computed: {
    cityLink: function(): string {
      return LSLR_CITY_LINKS.get(this.city) ?? '';
    },
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