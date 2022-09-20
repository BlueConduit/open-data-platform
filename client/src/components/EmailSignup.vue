<template>
  <div class='section'>
    <div class='h1-header'>Stay up to Date</div>
    <div class='h2-header'>We’re constantly adding data to our map. We can send
      you an email when your region is availabe.
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
          target: '#hubspotForm',
        });
      }
    });
  },
});
</script>

<style scoped lang='scss'>
@import '../assets/styles/global.scss';

#hubspotForm {

}

.section {
  background-color: $white;

  background-image: url('~@/assets/media/landing-image-3.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
</style>