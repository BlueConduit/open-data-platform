<template>
  <div>
    <div class='header-section'>
      <div class='h2-header-large'>
        {{ MESSAGES.CONTACT_YOUR_CITY_HEADER }}
      </div>
      <div>
        {{ MESSAGES.CONTACT_YOUR_CITY_SUBHEADER }}
      </div>
    </div>
    <div class='city-information'>
      <div class='h2-header'> {{ this.city }}</div>
      <a class='h2-header' :href='website' target='_blank'>{{ website }}</a>
      <div class='h2-header'> Tel: {{ phoneNumber }}</div>
    </div>
  </div>
</template>

<script lang='ts'>

import { defineComponent, PropType } from 'vue';
import { City } from '../../model/states/model/geo_data';
import { ScorecardMessages } from '../../assets/messages/scorecard_messages';

interface CityContactInfo {
  name: City;
  website: string;
  phoneNumber: string;
}

// TODO: Move to table in DB if we get more entries.
const CITY_INFO: Map<City, CityContactInfo> = new Map([
  [
    City.newOrleans,
    {
      name: City.newOrleans,
      website: 'https://www.swbno.org/DrinkingWater/LeadAwareness',
      phoneNumber: '(504) 529-2837',
    },
  ],
  [
    City.richmond,
    {
      name: City.richmond,
      website: 'https://www.vdh.virginia.gov/richmond-city/healthy-homes',
      phoneNumber: '(804) 205-3726',
    },
  ],
  [
    City.toledo,
    {
      name: City.toledo,
      website: 'https://toledo.oh.gov/residents/water/lead-service-lines',
      phoneNumber: '(419)-936-2020',
    },
  ],
]);

/**
 * Component for the contact city section of scorecard.
 *
 * Only shows up when result is in a supported city.
 */
export default defineComponent({
  name: 'ContactCitySection',
  props: {
    city: {
      type: String as PropType<City>,
      default: City.unknown,
    },
  },
  data() {
    return {
      MESSAGES: ScorecardMessages,
    };
  },
  computed: {
    website(): string {
      return CITY_INFO.get(this.city)?.website ?? '';
    },
    phoneNumber(): string {
      return CITY_INFO.get(this.city)?.phoneNumber ?? '';

    },
  },
});
</script>

<style scoped lang='scss'>
@import 'src/assets/styles/global';
@import 'node_modules/@blueconduit/copper/scss/01_settings/design-tokens';

.city-information {
  background-color: $light-gold;
  padding: $spacing-lg;
  margin-top: $spacing-lg;
  border-radius: $spacing-xs;
}
</style>