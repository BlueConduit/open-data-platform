<template>
  <NavigationBar />
</template>

<script lang="ts">
import { defineComponent, provide, reactive } from 'vue';
import '@blueconduit/copper/dist/css/copper.css';
import NavigationBar from './components/NavigationBar.vue';
import { State } from './model/state';

import { leadAndCopperViolationsByCountyDataLayer } from './data_layer_configs/lead_and_copper_violations_by_water_system_config';
import { leadServiceLinesByWaterSystemLayer } from './data_layer_configs/lead_service_lines_by_water_systems_config';
import { stateKey } from './injection_keys';

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

    provide(stateKey, state);

    return {
      state,
    };
  },
  mounted() {
    // Fetch data needed to render data layers and update state.
    if (this.state != null) {
      const dataLayers = [leadServiceLinesByWaterSystemLayer, leadAndCopperViolationsByCountyDataLayer];

      this.state.currentDataLayer = dataLayers[0];
      this.state.dataLayers = dataLayers;
    }
  },
});

</script>
<style>
@import "./assets/styles/global.scss";
</style>