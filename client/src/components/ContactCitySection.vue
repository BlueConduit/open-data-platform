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

import { City } from '../model/states/model/geo_data';
import { defineComponent, PropType } from 'vue';
import { ScorecardMessages } from '../assets/messages/scorecard_messages';

interface CityInformation {
  name: City;
  website: string;
  phoneNumber: string;
}

const CITY_INFO: CityInformation[] = [
  {
    name: City.newOrleans,
    website: 'https://www.swbno.org/DrinkingWater/LeadAwareness',
    phoneNumber: '(504) 529-2837',
  },
  {
    name: City.richmond,
    website: 'https://www.vdh.virginia.gov/richmond-city/healthy-homes',
    phoneNumber: '(804) 205-3726',
  },
  {
    name: City.toledo,
    website: 'https://toledo.oh.gov/residents/water/lead-service-lines',
    phoneNumber: '(419)-936-2020',
  },
];

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
    },
  },
  data() {
    return {
      MESSAGES: ScorecardMessages,
    };
  },
  computed: {
    website(): string {
      const currentCity = CITY_INFO.filter((currentCity) => currentCity.name == this.city)[0];
      return currentCity?.website ?? '';
    },
    phoneNumber(): string {
      const currentCity = CITY_INFO.filter((currentCity) => currentCity.name == this.city)[0];
      return currentCity?.phoneNumber ?? '';
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.city-information {
  background-color: $light-gold;
  padding: $spacing-lg;
  margin-top: $spacing-lg;
  border-radius: $spacing-xs;
}
</style>