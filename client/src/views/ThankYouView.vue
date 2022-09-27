<template>
  <div class='h1-header-large'>
    {{ messages.THANK_YOU_MESSAGE }}
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { LandingPageMessages } from '../assets/messages/landing';

export default defineComponent({
  name: 'ThankYouView',
  data() {
    return {
      messages: LandingPageMessages,
    };
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import 'bulma/sass/helpers/typography.sass';

.h1-header-large {
  @include center-container;
  color: $navy-blue;
  height: 100%;
}
</style>