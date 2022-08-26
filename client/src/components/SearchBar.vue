<template>
  <div class='searchbar-container'>
    <div class='data-layer-options'>
      <search-bar-option
        v-for='option in options'
        :key='option'
        :text-content='option.name'
        :selected='getSelected(option)'
        @click='setSelected(option)' />
    </div>
    <div class='select-wrapper'>
      <vue-select
        label='name'
        v-model='this.selectedOption'
        :options='this.options' />
    </div>
    <div class='search-wrapper'>
      <map-geocoder-wrapper class='search'
                            :baseUrl='MAP_ROUTE_BASE'
                            v-model:expandSearch='showSearch' />
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, inject } from 'vue';
import SearchBarOption from './SearchBarOption.vue';
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { DataLayer, MapLayer } from '../model/data_layer';
import MapGeocoderWrapper from './MapGeocoderWrapper.vue';
import { dispatch, useSelector } from '../model/store';
import { ALL_DATA_LAYERS, setCurrentDataLayer } from '../model/slices/map_data_slice';
import { MapDataState } from '../model/states/map_data_state';
import { leadServiceLinesByWaterSystemLayer } from '../data_layer_configs/lead_service_lines_by_water_systems_config';
import { MapData } from '../model/states/model/map_data';
import { MAP_ROUTE_BASE } from '../router';

export default defineComponent({
  name: 'SearchBar',
  components: { MapGeocoderWrapper, SearchBarOption, VueSelect },
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
     * Updates the selected option to {@code option} from a click on an option button.
     *
     * @param option
     */
    setSelected(option: DataLayer): void {
      this.selectedOption = option;
    },
  },
  watch: {
    // If selectedOption changes update state data layer.
    selectedOption: function(newOption: DataLayer): void {
      if (newOption == null) {
        return;
      }
      dispatch(setCurrentDataLayer(newOption.id));
    },
    'mapState.mapData': {
      handler(mapData: MapData): void {
        const allLayers: Array<DataLayer> = Array.from(ALL_DATA_LAYERS.values());
        this.options = allLayers.filter(layer => layer.visibleInSearchBar);
        const newDataLayer = mapData?.currentDataLayerId;

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
  height: 54px;
  padding: 0 15px;
  align-items: center;
  justify-content: space-between;
}

/** Style vue-select dropdown. */
.vs__dropdown-toggle {
  height: 40px;
}
</style>