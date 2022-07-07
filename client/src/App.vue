<template>
  <NavigationBar />
</template>

<script lang="ts">
import { defineComponent, onMounted, provide, reactive } from 'vue';
import '@blueconduit/copper/dist/css/copper.css';
import NavigationBar from './components/NavigationBar.vue';
import { State } from './model/state';

import { leadAndCopperViolationsByCountyDataLayer } from './data_layer_configs/lead_and_copper_violations_by_water_system_config';
import { leadServiceLinesByWaterSystemLayer } from './data_layer_configs/lead_service_lines_by_water_systems_config';
import { populationDataByCensusBlockLayer } from './data_layer_configs/population_by_census_block_config';
import { stateKey } from './injection_keys';
import { DataLayer, MapLayer, TileDataLayer } from './model/data_layer';
import router from './router';

const DATA_LAYERS_AS_LIST  = [leadServiceLinesByWaterSystemLayer, leadAndCopperViolationsByCountyDataLayer, populationDataByCensusBlockLayer];

const DATA_LAYERS = new Map<MapLayer, DataLayer>([
  [MapLayer.LeadServiceLineByWaterSystem, leadServiceLinesByWaterSystemLayer],
  [MapLayer.LeadAndCopperRuleViolationsByWaterSystem, leadAndCopperViolationsByCountyDataLayer],
  [MapLayer.PopulationByCensusBlock, populationDataByCensusBlockLayer]
]);

// Base URL for REST API in Amazon API Gateway.
// See https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-call-api.html.

export default defineComponent({
  name: 'App',
  components: {
    NavigationBar,
  },
  setup() {
    // Create and provide default state. This is updated once API data is fetched.
    const state = reactive(new State([]));
    // if (router.currentRoute.value.query.layer != null) {
    //   state.currentDataLayer = DATA_LAYERS_AS_LIST.find(layer => layer.styleLayer.id == router.currentRoute.value.query.layer) as TileDataLayer;
    // } else {
    //   state.currentDataLayer = leadServiceLinesByWaterSystemLayer;
    // }
    state.currentDataLayer = populationDataByCensusBlockLayer
    state.dataLayers = [populationDataByCensusBlockLayer]

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