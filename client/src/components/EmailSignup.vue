<template>
  <div class='section form-wrapper columns'>
    <div class='header-section column is-half is-centered'>
      <div class='h1-header-large centered-text'>Stay up to Date</div>
      <div class='h2-header-large centered-text mt-4'>
        We’re constantly adding data to our map. We can send you an email when
        your region is available.
      </div>
    </div>
    <div id='hubspotForm' v-once></div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EmailSignup',
  mounted() {
    const script = document.createElement('script');
    script.src = '//js.hsforms.net/forms/v2.js';
    script.type = 'text/javascript';
    const formScript = document.createElement('script');
    document.body.appendChild(script);
    document.body.appendChild(formScript);

    script.addEventListener('load', () => {
      if (window.hbspt) {
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
@import 'bulma/sass/layout/section.sass';
@import 'bulma/sass/grid/columns.sass';
@import 'bulma/sass/helpers/spacing';

.h1-header-large,
.h2-header-large {
  color: $warm-grey-800;
}

.form-wrapper {
  background-color: $white;

  background-image: url('~@/assets/media/landing-image-3.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
</style>