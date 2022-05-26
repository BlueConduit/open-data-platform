<template>
  <div class="container">
    <div class='data-layer-options'>
      <search-bar-option
        v-for='option in options'
        :key='option'
        :text-content='option'
        :selected='getSelected(option)'
        @click='setSelected(option)'>
      </search-bar-option>
    </div>
    <div class="right-align">
      <div class="select-wrapper">
        <vue-select v-model="this.selectedOption" :options="this.options"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import SearchBarOption from './SearchBarOption.vue';
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default defineComponent({
  name: "SearchBar",
  components: {SearchBarOption, VueSelect},
  data() {
    return {
      selectedOption: this.initialSelectedOption,
    }
  },
  props: {
    initialSelectedOption: {
      type: String,
      required: true,
    },
    options: {
      type: Array as PropType<string[]>,
      required: true,
    }
  },
  methods: {
    getSelected(option: string): boolean {
      return option === this.selectedOption;
    },
    setSelected(option: string): void {
      this.selectedOption = option;
    },
  },
})
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