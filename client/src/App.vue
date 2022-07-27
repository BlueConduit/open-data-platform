<template>
  <NavigationBar />
</template>

<script lang='ts'>
import { defineComponent, provide, reactive } from 'vue';
import '@blueconduit/copper/dist/css/copper.css';
import NavigationBar from './components/NavigationBar.vue';
import { State } from './model/state';

import { configureStore } from '@reduxjs/toolkit';
import { leadServiceLinesByWaterSystemLayer } from './data_layer_configs/lead_service_lines_by_water_systems_config';
import { stateKey } from './injection_keys';
import { DataLayer, MapLayer } from './model/data_layer';
import { populationDataByCensusBlockLayer } from './data_layer_configs/population_by_census_block_config';
import { leadAndCopperViolationsByCountyDataLayer } from './data_layer_configs/lead_and_copper_violations_by_water_system_config';
import { leadServiceLinesByParcelLayer } from './data_layer_configs/lead_service_lines_by_parcel_config';
import geosReducer from './model/geo_slice';

const DATA_LAYERS = new Map<MapLayer, DataLayer>([
  [MapLayer.LeadServiceLineByWaterSystem, leadServiceLinesByWaterSystemLayer],
  [MapLayer.LeadAndCopperRuleViolationsByWaterSystem, leadAndCopperViolationsByCountyDataLayer],
  [MapLayer.PopulationByCensusBlock, populationDataByCensusBlockLayer],
  [MapLayer.LeadServiceLineByParcel, leadServiceLinesByParcelLayer],
]);

// Base URL for REST API in Amazon API Gateway.
// See https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-call-api.html.

export default defineComponent({
  name: 'App',
  components: {
    NavigationBar,
  },
  setup() {

    const reducer = (state = 0, action: string) => {
      console.log('reducer called');
      return state;
    };

    const store = configureStore({ reducer: { geosReducer } });

    store.subscribe(() => {
      console.log('current state', store.getState());
    });

    // Create and provide default state. This is updated once API data is fetched.
    const state = reactive(new State([]));
    state.dataLayers = Array.from(DATA_LAYERS.values());

    provide(stateKey, state);

    return {
      state,
    };
  },
});

</script>
<style>
@import "./assets/styles/global.scss";
</style>