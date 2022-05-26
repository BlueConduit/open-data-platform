<template>
  <div class="container">
    <div>
      <search-bar-option
          v-for="option in options"
          :key="option"
          :text-content="option"
          :selected="selected(option)">
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
import {defineComponent, PropType} from 'vue';
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
    selected(option: string) {
      return option === this.selectedOption;
    }
  },
})
</script>

<style>
.container {
  display: flex;
  height: 54px;
  padding: 0 30px;
  display: flex;
  align-items: center;
}

/*.container div {*/
/*  padding: 0 30px;*/
/*  display: flex;*/
/*  align-items: center;*/
/*}*/

.right-align {
  flex-grow: 1;
  justify-content: flex-end;
}

.select-wrapper {
  display: inline-block;
  min-width: 241px;
}
</style>