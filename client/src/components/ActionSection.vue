<template>
  <div class='container-column center-container' :style='style'>
    <div class='h2-header'>
      {{ header }}
    </div>
    <div class='explain-text' v-if='subheader != null'>
      {{ subheader }}
    </div>
    <button class='gold-button'
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

<style scoped lang='scss'>
@import '../assets/styles/global.scss';

.center-container {
  gap: 20px;
  padding: 20px;
}

</style>