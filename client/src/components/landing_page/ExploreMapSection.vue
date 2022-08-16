<template>
  <LandingPageSection :messages='messages.MapInfo'
                      :styles='styles.DEFAULT_STYLE'>
    <img class='static-map'
         alt=''
         :src='require(`@/assets/media/static-map.png`)'>
    <button class='explore-map-button' @click='goToMap'>
      {{ messages.MapInfo.CTA_BUTTON }}
    </button>
  </LandingPageSection>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import LandingPageSection from './LandingPageSection.vue';
import * as messages from '@/assets/messages/landing';
import { LandingPageStyles as styles } from '@/assets/styles/style_props';
import { router } from '@/router';

export default defineComponent({
  name: 'ExploreMapSection',
  components: {
    LandingPageSection,
  },
  data() {
    return {
      messages,
      styles,
    };
  },
  methods: {
    goToMap(): void {
      router.push({
        path: '/map',
      });
    },
  },
});
</script>

<style scoped>
.explore-map-button {
  width: fit-content;
  height: 65px;
  padding: 0 19px;
  border-radius: 16px;
  background-color: #FFC300;
  border: 0;
  font-size: 18px;
}

.static-map {
  width: 920.5px;
  height: 467.5px;
  border-radius: 15px;

  background: #FBFBFB;
  box-shadow: 0 1px 32px rgba(0, 0, 0, 0.08), 0 12px 16px rgba(0, 0, 0, 0.12), 0 8px 12px -6px rgba(0, 0, 0, 0.16);
}
</style>