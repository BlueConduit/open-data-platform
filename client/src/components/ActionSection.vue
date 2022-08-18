<template>
  <div class='container-column center-container' :style='style'>
    <div class='h1-header semi-bold'>
      {{ header }}
    </div>
    <div class='explain-text' v-if='subheader != null'>
      {{ subheader }}
    </div>
    <button class='outline-button'
            v-if='buttonText != null'
            v-on:click='onButtonClick'>
      {{ buttonText }}
    </button>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActionSection',
  props: {
    // Allows parent to determine styling for this component.
    style: [String, Object],
    header: String,
    subheader: String,
    buttonText: String,
  },
  methods: {
    onButtonClick() {
      this.$emit('onButtonClick', true);
    },
  },
});
</script>

<style scoped>
.center-container {
  gap: 20px;
  padding: 20px;
}

.outline-button {
  color: #464646;
}

</style>