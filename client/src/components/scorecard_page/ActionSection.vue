<template>
  <div class='is-flex'>
    <div class='h2-header-large'>
      {{ header }}
    </div>
    <div class='container explain-text' v-if='subheader != null'>
      {{ subheader }}
    </div>
    <img v-if='image != null'
         :src='require(`@/assets/media/${image}`)'
         alt=''
         class='is-hidden-mobile' />
    <Popper v-if='buttonText != null'
            arrow
            class='tooltip-content'
            :content='buttonTooltip'
            :show='showTooltip'>
      <button class='gold-button'
              v-on:click='onButtonClick'>
        {{ buttonText }}
        <img v-if='buttonIcon != null'
             :src='require(`@/assets/icons/${buttonIcon}`)'
             alt=''
             class='icon'>
      </button>
    </Popper>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import Popper from 'vue3-popper';

const ONE_SECOND = 1000;

export default defineComponent({
  name: 'ActionSection',
  components: { Popper },
  props: {
    header: String,
    subheader: String,
    buttonIcon: String,
    buttonText: String,
    buttonTooltip: String,
    copyText: {
      default: window.location.href,
      type: String,
    },
    image: String,
  },
  methods: {
    onButtonClick() {
      this.showTooltip = true;
      this.$emit('onButtonClick', true);
      setTimeout(() => this.showTooltip = false, ONE_SECOND);
    },
  },
  data() {
    return {
      showTooltip: false,
    };
  },
});
</script>

<style scoped lang='scss'>
@import 'src/assets/styles/global';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.is-flex {
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
}

.icon {
  max-width: $spacing-md;
}

img {
  border-radius: $spacing-sm;
  max-width: $spacing-lg * 20;
}

// These variables cannot reference css vars
.tooltip-content {
  --popper-theme-background-color: #333333;
  --popper-theme-text-color: white;
  --popper-theme-border-width: 0px;
  --popper-theme-border-style: solid;
  --popper-theme-border-radius: 6px;
  --popper-theme-padding: 5px 14px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);

  :deep(.popper) {
    font-size: 12px;
  }
}

</style>
