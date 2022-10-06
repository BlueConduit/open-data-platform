<template>
  <div class='is-flex'>
    <img class='is-hidden-mobile'
         :src='require(`@/assets/media/get-notified.png`)'
         alt='' />
    <div class='section form-wrapper columns'>
      <div class='header-section column is-half'>
        <div class='h1-header-large'>
          {{ messages.SUBSCRIBE_HEADER }}
        </div>
        <div class='h2-header-large mt-4'>
          {{ messages.SUBSCRIBE_SUBHEADER }}
        </div>
      </div>
      <div id='hubspotForm' v-once></div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { LandingPageMessages } from '../assets/messages/landing';

/**
 * Section containing form to sign up for LeadOut data updates.
 *
 * This wraps a hubspot form which is configured and styled in the hubspot editor.
 */
export default defineComponent({
  name: 'EmailSignup',
  data() {
    return {
      messages: LandingPageMessages,
    };
  },
  mounted() {
    // Create script tag which contains logic to attach embedded hubspot form to a div rendered in
    // the template. This is necessary since vue does not allow script tags in the template.
    const script = document.createElement('script');
    script.src = '//js.hsforms.net/forms/v2.js';
    script.type = 'text/javascript';
    const formScript = document.createElement('script');
    document.body.appendChild(script);
    document.body.appendChild(formScript);

    script.addEventListener('load', () => {
      if (window.hbspt) {
        // LeadOut Website Subscribe Form.
        window.hbspt.forms.create({
          region: 'na1',
          portalId: '7810253',
          formId: '71414f17-0b7b-4fe1-ba58-fa6cfb58b83a',
          version: 'V2_PRERELEASE',
          target: '#hubspotForm',
        });
      }
    });
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';
@import 'bulma/sass/helpers/spacing';

.is-flex {
  overflow: hidden;
}

.h1-header-large,
.h2-header-large {
  color: $white;
}

.form-wrapper {
  @include background-image;

  background-color: $navy-blue;
}

#hubspotForm {
  max-width: 400px
}
</style>