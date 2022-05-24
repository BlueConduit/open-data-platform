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
      <img src="../assets/search-icon.png" class="icon"/>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import SearchBarOption from './SearchBarOption.vue';

export default defineComponent({
  name: "SearchBar",
  components: {SearchBarOption},
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

<style scoped>
.container {
  display: flex;
  height: 54px;
}

.container  div {
  padding: 0 30px;
  display: flex;
  align-items: center;
}

.right-align {
  flex-grow: 1;
  justify-content: flex-end;
}
</style>