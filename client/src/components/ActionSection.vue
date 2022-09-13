<template>
  <div class='container-column center-container' :style='style'>
    <div class='h2-header-large'>
      {{ header }}
    </div>
    <div class='explain-text' v-if='subheader != null'>
      {{ subheader }}
    </div>
    <button class='gold-button'
            v-if='buttonText != null'
            v-clipboard:copy='copyText'
            v-clipboard:success='onButtonClick'>
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
    copyText: {
      default: window.location.href,
      type: String,
    },
  },
  methods: {
    onButtonClick() {
      console.log(`here`);
      this.$emit('onButtonClick', true);
    },
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.center-container {
  gap: $spacing-sm;
  padding: $spacing-lg;
}

.explain-text {
  text-align: center;
}

</style>