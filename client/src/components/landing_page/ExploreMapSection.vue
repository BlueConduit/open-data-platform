<template>
  <LandingPageSection class='section'
                      :messages='messages.MapInfo'
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

/**
 * Content for 'Explore map' section of the landing page.
 */
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
  box-shadow: 0 4px 6px 2px rgba(70, 70, 70, 0.25);
}

.section {
  padding: 71px 25px;
}
</style>