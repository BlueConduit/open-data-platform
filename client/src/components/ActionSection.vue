<template>
  <div class='container-column center-container'>
    <div class='h1-header'>
      {{ header }}
    </div>
    <div class='explain-text'>
      {{ subheader }}
    </div>
    <button class='' @click='$emit(&apos; onButtonClick &apos;)'>{{ buttonText }}</button>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActionSection',
  props: {
    header: String,
    subheader: String,
    buttonText: String,
  },
  computed: {
    cssVars() {
      return {
        '--height': '225px',
      };
    },
  },
});
</script>

<style scoped>

.center-container {
  gap: 20px;
  height: var(--height);
}


</style>