<template>
  <div class="selected" v-if="selected">
    {{ textContent }}
  </div>
  <div class="unselected" v-else>
    {{ textContent }}
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: "SearchBarOption",
  props: {
    textContent: {
      type: String,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false
    },
  }
})
</script>

<style scoped>
.selected, .unselected {
  width: 186px;
  height: 26px;
  border-radius: 30px;
  padding: 0 30px;
  display: flex;
  align-items: center;
}

.selected {
  background-color: #E5E5E580;
  border: 1.5px solid #000000;
}

.unselected {
  background-color: white;
  border: 1.5px solid grey;
}
</style>