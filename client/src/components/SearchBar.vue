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
      <map-geocoder-wrapper class='search' v-model:expandSearch='showSearch' />
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, inject } from 'vue';
import SearchBarOption from './SearchBarOption.vue';
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { State } from '../model/state';
import { stateKey } from '../injection_keys';
import { DataLayer, MapLayer } from '../model/data_layer';
import MapGeocoderWrapper from './MapGeocoderWrapper.vue';

export default defineComponent({
  name: 'SearchBar',
  components: { MapGeocoderWrapper, SearchBarOption, VueSelect },
  setup() {
    const state: State | undefined = inject(stateKey);

    return {
      state,
    };
  },
  data() {
    return {
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
      this.state?.setCurrentDataLayer(newOption);
    },
    state: {
      handler(newState: State): void {
        if (newState != null) {
          this.options = newState.dataLayers.filter(layer => layer.visibleInSearchBar);
          if (newState.currentDataLayer?.id != MapLayer.LeadServiceLineByParcel) {
            this.selectedOption = newState.currentDataLayer;
          }
        }
      },
      // Make watcher deep, meaning that this will be triggered on a change to any nested field of state.
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
  display: inline-block;
  padding-left: 15px;
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