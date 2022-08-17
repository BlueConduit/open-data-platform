<template>
  <div class='main'>
    <NavigationBar />
    <router-view />
    <PageFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent, provide, reactive } from 'vue';
import { RouteLocation } from 'vue-router';
import '@blueconduit/copper/css/copper.css';
import NavigationBar from './components/NavigationBar.vue';
import { State } from './model/state';
import { leadServiceLinesByWaterSystemLayer } from './data_layer_configs/lead_service_lines_by_water_systems_config';
import { stateKey } from './injection_keys';
import { DataLayer, MapLayer } from './model/data_layer';
import { populationDataByCensusBlockLayer } from './data_layer_configs/population_by_census_block_config';
import { leadAndCopperViolationsByCountyDataLayer } from './data_layer_configs/lead_and_copper_violations_by_water_system_config';
import { leadServiceLinesByParcelLayer } from './data_layer_configs/lead_service_lines_by_parcel_config';
import { queryLatLong } from './model/slices/geo_data_slice';
import { dispatch } from './model/store';
import { LAT_LONG_PARAM } from './router';
import { GeoType } from './model/states/model/geo_data';
import PageFooter from './components/PageFooter.vue';

const DEFAULT_TITLE = 'LeadOut';
const DATA_LAYERS = new Map<MapLayer, DataLayer>([
  [MapLayer.LeadServiceLineByWaterSystem, leadServiceLinesByWaterSystemLayer],
  [MapLayer.LeadAndCopperRuleViolationsByWaterSystem, leadAndCopperViolationsByCountyDataLayer],
  [MapLayer.PopulationByCensusBlock, populationDataByCensusBlockLayer],
  [MapLayer.LeadServiceLineByParcel, leadServiceLinesByParcelLayer],
]);

/**
 * This file contains the component(s) that are visible in every view.
 */
export default defineComponent({
  name: 'App',
  components: {
    NavigationBar,
    PageFooter,
  },
  setup() {
    // Create and provide default state. This is updated once API data is fetched.
    const state = reactive(new State([]));
    state.dataLayers = Array.from(DATA_LAYERS.values());

    provide(stateKey, state);

    return {
      state,
    };
  },
  watch: {
    // Current route location. See https://router.vuejs.org/api/#component-injections.
    $route(to: RouteLocation) {
      const latLongValue: string = to.params[LAT_LONG_PARAM] as string;

      if (latLongValue?.length > 0) {
        const latLong = latLongValue.split(',');
        const lat = latLong[0];
        const long = latLong[1];

        // TODO: Pass real geo type.
        dispatch(queryLatLong(lat, long, GeoType.postcode));
      }

      // TODO: consider adding a string that says this is a non-prod environment, so devs can see
      // that at a glance in their browser tabs. E.g. "[sandbox] LeadOut - Home"
      document.title = (to.meta.title as string) ?? DEFAULT_TITLE;
    },
  },
});
</script>
<style>
@import './assets/styles/global.scss';
/* Make sure there's no empty space at the bottom of the page. */
html,
body,
#app,
.main {
  height: 100%;
}
</style>
