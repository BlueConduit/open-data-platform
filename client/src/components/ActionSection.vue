<template>
  <div class='container-column center-container' :style='cssVars'>
    <div class='h2-header semi-bold'>
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
    bgColor: {
      type: String,
      default: '#FFFFFF',
    },
    buttonColor: {
      type: String,
      default: '#464646',
    },
    height: {
      type: Number,
      default: 300,
    },
    header: String,
    subheader: String,
    buttonText: String,
  },
  computed: {
    cssVars() {
      return {
        '--bg-color': this.bgColor,
        '--button-color': this.buttonColor,
        '--height': `${this.height + 'px'}`,
      };
    },
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
  background-color: var(--bg-color);
  gap: 20px;
  height: var(--height);
  padding: 20px;
}

.outline-button {
  color: var(--button-color)
}

</style>