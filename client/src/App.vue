<template>
  <NavigationBar />
</template>

<script lang="ts">
import { defineComponent, provide } from 'vue';
import '@blueconduit/copper/dist/css/copper.css';
import NavigationBar from './components/NavigationBar.vue';
import { stateKey } from './injection_keys';
import { DataLayer } from './model/data_layer';
import { State } from './model/state';
import { populationByCountyDataLayer } from './data_layer_configs/population_by_county_config';

export default defineComponent({
  name: 'App',
  components: {
    NavigationBar,
  },
  setup() {
    // TODO(kailamjeter): bind map data to state.
    // Create and provide state.
    const initialDataLayer: DataLayer = populationByCountyDataLayer;
    provide(stateKey, new State([initialDataLayer], initialDataLayer));
  },
});

</script>
<style>
@import "./assets/styles/global.scss";
</style>