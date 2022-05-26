<template>
  <div class='container'>
    <div class='data-layer-options'>
      <search-bar-option
        v-for='option in options'
        :key='option'
        :text-content='option.name'
        :selected='getSelected(option)'
        @click='setSelected(option)'>
      </search-bar-option>
    </div>
    <div class='right-align'>
      <div class='select-wrapper'>
        <vue-select label='name' v-model='this.selectedOption'
                    :options='this.options' />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import SearchBarOption from './SearchBarOption.vue';
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { State } from '../model/state';
import { stateKey } from '../injection_keys';
import { DataLayer } from '../model/data_layer';

export default defineComponent({
  name: 'SearchBar',
  components: { SearchBarOption, VueSelect },
  setup() {
    const store: State | undefined = inject(stateKey);

    return {
      store,
    };
  },
  data() {
    return {
      // TODO figure out how to not have a defaults
      selectedOption: new DataLayer('fake layer'),
      options: [] as DataLayer[],
    };
  },
  methods: {

    /**
     * Returns whether option is the selected option.
     *
     * @param option
     */
    getSelected(option: DataLayer): boolean {
      return option === this.selectedOption;
    },

    /**
     * Updates the selected option.
     * @param option
     */
    setSelected(option: DataLayer): void {
      this.selectedOption = option;
      if (this.store) {
        this.store.setCurrentDataLayer(this.selectedOption);
      }
    },
  },
  mounted() {
    if (this.store != null) {
      this.options = this.store.dataLayers;
      this.selectedOption = this.store.currentDataLayer;
    }
  },
});
</script>

<style scoped>
.container {
  display: flex;
  height: 54px;
  padding: 0 15px;
  align-items: center;
  justify-content: space-between;
}

.data-layer-options {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.select-wrapper {
  display: inline-block;
  min-width: 241px;
}
</style>