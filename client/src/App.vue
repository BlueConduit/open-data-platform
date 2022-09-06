<template>
  <div class='main'>
    <ResponsiveNav />
    <router-view />
    <PageFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RouteLocation } from 'vue-router';
import '@blueconduit/copper/css/copper.css';
import { clearGeoIds, queryLatLong } from './model/slices/geo_data_slice';
import { dispatch, useSelector } from './model/store';
import { GEOTYPE_PARAM, LAT_LONG_PARAM, LAYER_PARAM } from './router';
import { GeoType } from './model/states/model/geo_data';
import PageFooter from './components/PageFooter.vue';
import { clearMapData, setCurrentDataLayer } from './model/slices/map_data_slice';
import { MapDataState } from './model/states/map_data_state';
import { MapLayer } from './model/data_layer';
import { clearLeadData } from './model/slices/lead_data_slice';
import { clearDemographicData } from './model/slices/demographic_data_slice';
import ResponsiveNav from './components/ResponsiveNav.vue';

const DEFAULT_TITLE = 'LeadOut';

/**
 * This file contains the component(s) that are visible in every view.
 */
export default defineComponent({
  name: 'App',
  components: {
    PageFooter,
    ResponsiveNav,
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
      const latLongValue: string = to.params[LAT_LONG_PARAM] as string;
      const geoTypeValue: string = to.params[GEOTYPE_PARAM] as string;

      if (latLongValue?.length > 0) {
        const latLong = latLongValue.split(',');
        const lat = latLong[0];
        const long = latLong[1];
        const geoType = Object.values(GeoType).find((geo) => geo == geoTypeValue) as GeoType;
        dispatch(queryLatLong(lat, long, geoType));
      } else {
        dispatch(clearGeoIds());
        dispatch(clearLeadData());
        dispatch(clearDemographicData());
        dispatch(clearMapData());
      }

      // Check whether router has a param with the layer to show on the map.
      // Otherwise, default to water systems.
      const currentDataLayerId = this.mapState?.mapData?.dataLayers?.find((l: any) => layerId == l);
      dispatch(setCurrentDataLayer(currentDataLayerId ?? MapLayer.LeadServiceLineByWaterSystem));

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
