<template>
  <div class='main'>
    <NavigationBar />
    <router-view />
    <PageFooter />
  </div>
</template>

<script lang='ts'>
import { defineComponent, provide, reactive } from 'vue';
import { RouteLocation } from 'vue-router';
import '@blueconduit/copper/css/copper.css';
import NavigationBar from './components/NavigationBar.vue';
import { State } from './model/state';
import { stateKey } from './injection_keys';
import { queryLatLong } from './model/slices/geo_data_slice';
import { dispatch, useSelector } from './model/store';
import { LAT_LONG_PARAM, LAYER_PARAM } from './router';
import { GeoType } from './model/states/model/geo_data';
import PageFooter from './components/PageFooter.vue';
import { ALL_DATA_LAYERS, setCurrentDataLayer } from './model/slices/map_data_slice';
import { MapDataState } from './model/states/map_data_state';
import { leadServiceLinesByWaterSystemLayer } from './data_layer_configs/lead_service_lines_by_water_systems_config';

const DEFAULT_TITLE = 'LeadOut';


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
    const mapState = useSelector((state) => state.mapData) as MapDataState;
    return {
      mapState,
    };
  },
  watch: {
    // Current route location. See https://router.vuejs.org/api/#component-injections.
    $route(to: RouteLocation) {
      const layerId = to.query[LAYER_PARAM];
      console.log(layerId);
      const latLongValue: string = to.params[LAT_LONG_PARAM] as string;

      if (latLongValue?.length > 0) {
        const latLong = latLongValue.split(',');
        const lat = latLong[0];
        const long = latLong[1];

        // TODO: Pass real geo type.
        dispatch(queryLatLong(lat, long, GeoType.postcode));
      }

      // Check whether router has a param with the layer to show on the map.
      if (layerId != null) {
        const currentDataLayerId = this.mapState?.mapData?.dataLayers?.find(
          (l) => layerId == l,
        ) ?? leadServiceLinesByWaterSystemLayer.id;
        dispatch(setCurrentDataLayer(currentDataLayerId));
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
