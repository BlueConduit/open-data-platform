<template>
  <NavigationBar />
</template>

<script lang="ts">
import { defineComponent, provide, reactive } from 'vue';
import '@blueconduit/copper/dist/css/copper.css';
import NavigationBar from './components/NavigationBar.vue';
import { DataLayer, DataSourceType } from './model/data_layer';
import { State } from './model/state';
import axios from 'axios';
import { leadAndCopperViolationsByCountyDataLayer } from './data_layer_configs/lead_and_copper_violations_by_county_config';
import { stateKey } from './injection_keys';
import { leadServiceLinesByWaterSystemLayer } from './data_layer_configs/water_systems_config';
import { populationDataByCensusBlockLayer } from './data_layer_configs/population_by_census_block_config';

// Base URL for REST API in Amazon API Gateway.
// See https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-call-api.html.
const OPEN_DATA_PLATFORM_API_URL = 'https://v2rz6wzmb7.execute-api.us-east-2.amazonaws.com/default';

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
  async mounted() {
    // Fetch data needed to render data layers and update state.
    if (this.state != null) {
      const dataLayers = [
        leadServiceLinesByWaterSystemLayer,
        leadAndCopperViolationsByCountyDataLayer,
        populationDataByCensusBlockLayer,
      ];
      await this.fetchInitialData(dataLayers);

      this.state.currentDataLayer = dataLayers[0];
      this.state.dataLayers = dataLayers;
    }
  },
  methods: {
    /**
     * Fetch initial data needed to render the map.
     *
     * This includes data to render the Population data layer.
     */
    async fetchInitialData(layers: DataLayer[]): Promise<void> {
      // TODO(kailamjeter): expand to fetch for other data layers.
      await axios
        .get(`${OPEN_DATA_PLATFORM_API_URL}/getViolations`)
        .then(response => layers.forEach(layer => {
          if (layer.source.type == DataSourceType.GeoJson) {
            return layer.source.data = response.data.toString();
          }
        }));
    },
  },
});

</script>
<style>
@import "./assets/styles/global.scss";
</style>