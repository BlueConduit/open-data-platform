<template>
  <div>
    <!--    TODO put messages in constants-->
    <div class='header-section'>
      <div class='h1-header'>Contact your city</div>
      <div class='h2-header'>
        Get more information or remediate any lead issues is to contact your
        city.
      </div>
    </div>
    <div class='city-information'>
      <div class='h2-header-large'> {{ this.city }}</div>
      <a class='h2-header-large' :href='website' target='_blank'>
        {{ website }}
      </a>
      <div class='h2-header-large'> Tel: {{ phoneNumber }}</div>
    </div>
  </div>
</template>

<script lang='ts'>

import { City } from '../model/states/model/geo_data';
import { defineComponent, PropType } from 'vue';

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

export default defineComponent({
  name: 'ContactCitySection',
  props: {
    city: {
      type: String as PropType<City>,
    },
  },
  computed: {
    website(): string {
      const currentCity = CITY_INFO.filter((currentCity) => currentCity.name == this.city)[0];
      return currentCity.website;
    },
    phoneNumber(): string {
      const currentCity = CITY_INFO.filter((currentCity) => currentCity.name == this.city)[0];
      return currentCity.phoneNumber;
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