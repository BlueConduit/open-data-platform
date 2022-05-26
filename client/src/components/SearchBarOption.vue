<template>
  <div class="selected" v-if="selected">
    {{ textContent }}
  </div>
  <div class="unselected" v-else>
    {{ textContent }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

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
  border-radius: 30px;
  padding: 5px 10px;

  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-left: 15px;
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