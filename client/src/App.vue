<template>
  <NavigationBar />
</template>

<script lang="ts">
import { defineComponent, provide, reactive } from 'vue';
import '@blueconduit/copper/dist/css/copper.css';
import NavigationBar from './components/NavigationBar.vue';
import { State } from './model/state';

import { leadAndCopperViolationsByCountyDataLayer } from './data_layer_configs/lead_and_copper_violations_by_water_system_config';
import { stateKey } from './injection_keys';
import { DataLayer, MapLayer } from './model/data_layer';

const DATA_LAYERS = new Map<MapLayer, DataLayer>([
  // [MapLayer.LeadServiceLineByWaterSystem, leadServiceLinesByWaterSystemLayer],
  [MapLayer.LeadAndCopperRuleViolationsByWaterSystem, leadAndCopperViolationsByCountyDataLayer],
  // [MapLayer.PopulationByCensusBlock, populationDataByCensusBlockLayer]
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
    state.currentDataLayer = leadAndCopperViolationsByCountyDataLayer;
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