<template>
  <div class='section is-medium p-6'>
    <div class='columns'>
      <div class='column is-one-third is-hidden-mobile p-5 image-wrapper'>
        <img class='image' alt=''
             src='../../assets/media/understanding-lsl-image.png' />
      </div>
      <div class='column why-leadout is-half'>
        <div class='header-section'>
          <div class='h1-header-xl'>
            {{ messages.UNDERSTANDING_LSL_HEADER }}
          </div>
          <div class='h2-header-large'>
            {{ messages.UNDERSTANDING_LSL_SUBHEADER }}
          </div>
          <router-link class='grey-button' :to='historyOfLeadRoute'>
            {{ messages.UNDERSTANDING_LSL_BUTTON_TEXT }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { LandingPageMessages } from '../../assets/messages/landing';
import { historyOfLead } from '../../assets/blog/history_of_lead';

export default defineComponent({
  name: 'UnderstandingLslSection',
  data() {
    return {
      messages: LandingPageMessages,
      historyOfLeadRoute: historyOfLead.route,
    };
  },
});
</script>

<style scoped lang='scss'>
@import '../../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.columns {
  height: fit-content;
  max-height: 650px;
}

.image {
  max-height: 100%;
}

.image-wrapper {
  display: flex;
  justify-content: flex-end;
}

.header-section {
  padding: $spacing-lg;
  gap: $spacing-lg;
  align-items: flex-start;
}

.section {
  background-color: $gold-200;
}
</style>