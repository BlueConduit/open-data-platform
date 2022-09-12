<template>
  <div>
    <!--    TODO put messages in constants-->
    <div>Contact your city</div>
    <div>
      Get more information or remediate any lead issues is to contact your city.
    </div>
    <div class='city-information'>
      <p> {{ this.city }}</p>
      <p> {{ website }}</p>
      <p> {{ phoneNumber }}</p>
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
    website: 'https://www.vdh.virginia.gov/richmond-city/healthy-homes/#:~:text=The%20Lead%20Safe%20Program%20provides,)%20205%2D3726%20for%20information.',
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

<style scoped>

</style>