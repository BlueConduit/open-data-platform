<template>
  <div class='searchbar-container'>
    <div>
      <span class='is-hidden-mobile'>View by:</span>
      <div class='select-wrapper'>
        <v-select
          label='name'
          :modelValue='this.selectedOption'
          :options='this.options'
          @update:modelValue='updateSelectedLayer' />
      </div>
    </div>
    <div class='search-wrapper'>
      <map-geocoder-wrapper class='search'
                            :baseUrl='MAP_ROUTE_BASE'
                            v-model:expandSearch='showSearch' />
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { DataLayer, MapLayer } from '../model/data_layer';
import MapGeocoderWrapper from './MapGeocoderWrapper.vue';
import { useSelector } from '../model/store';
import { ALL_DATA_LAYERS } from '../model/slices/map_data_slice';
import { MapDataState } from '../model/states/map_data_state';
import { leadServiceLinesByWaterSystemLayer } from '../data_layer_configs/lead_service_lines_by_water_systems_config';
import { MAP_ROUTE_BASE, router } from '../router';

export default defineComponent({
  name: 'SearchBar',
  components: { MapGeocoderWrapper, vSelect },
  setup() {
    const mapState = useSelector((state) => state.mapData) as MapDataState;

    return {
      mapState,
    };
  },
  data() {
    return {
      MAP_ROUTE_BASE,
      options: [] as DataLayer[],
      selectedOption: null as DataLayer | null,
      showSearch: false,
    };
  },
  methods: {

    /**
     * Returns whether {@code option} is the selected option.
     *
     * @param option
     */
    getSelected(option: DataLayer): boolean {
      return option === this.selectedOption;
    },

    /**
     * Updates the url with the selected {@code option} as the layer query parameter.
     *
     * @param option
     */
    updateSelectedLayer(option: DataLayer): void {
      router.push({
        query: Object.assign({}, router.currentRoute.value.query, {
          layer: option.id,
        }),
      });
    },
  },
  watch: {

    'mapState.mapData.currentDataLayerId': {
      handler(currentDataLayerId: MapLayer): void {
        const allLayers: Array<DataLayer> = Array.from(ALL_DATA_LAYERS.values());
        this.options = allLayers.filter(layer => layer.visibleInSearchBar);
        const newDataLayer = currentDataLayerId;

        if (newDataLayer != null && newDataLayer != MapLayer.LeadServiceLineByParcel) {
          const selected: DataLayer = this.options.find(option => option.id == newDataLayer) ?? leadServiceLinesByWaterSystemLayer;
          this.selectedOption = selected;
        }
      },
      deep: true,
    },
  },
});
</script>

<style>
.data-layer-options {
  display: flex;
  align-items: center;
  flex-grow: 1;
  min-width: fit-content;
}

.search-wrapper {
  display: flex;
  padding-left: 15px;
}

.search {
  display: flex;
}

.select-wrapper {
  display: inline-block;
  min-width: 241px;
  padding-left: 15px;
}

.searchbar-container {
  display: flex;
  min-height: 54px;
  padding: 0 15px;
  align-items: center;
  justify-content: space-between;
}

/** Style vue-select dropdown. */
.vs__dropdown-toggle {
  height: 40px;
}
</style>