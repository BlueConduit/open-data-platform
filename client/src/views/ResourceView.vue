<template>
  <div>
    <static-page-section :messages='messages.WaterFilterInfo'
                         :styles='STYLES'>
      <div class='static-content'>
        <span class='asset'><img
          :src='require(`@/assets/media/resource-image-1.png`)'
          alt=''></span>
        <span class='text'>{{ messages.WaterFilterInfo.BODY }}</span>
      </div>
    </static-page-section>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import * as messages from '../assets/messages/resources';
import StaticPageSection, { Styles } from '../components/StaticPageSection.vue';

const STYLES: Styles = {
  HEIGHT: '100px',
  BACKGROUND_COLOR: 'green',
};

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'ResourceView',
  components: { StaticPageSection },
  props: {
    image: { type: String, default: 'placeholder_image.png' },
  },
  data() {
    return {
      messages,
      STYLES,
    };
  },
});
</script>

<style scoped>

.static-content {
  width: 932px;
  display: flex;
  align-items: center;
  letter-spacing: 0.2px;
  text-transform: capitalize;
  margin-top: 24px;
}

.asset img {
  height: 472px;
  width: 494px;
}

.text {
  padding: 0 110px 0 38px;
  width: 290px;
  height: 204px;

  /* Headline 2 */
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 34px;
  /* or 142% */
  display: flex;
  align-items: center;

  /* Warm Grey/Warm Grey 600 */
  color: #7A7A7A;


  /* Inside auto layout */
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;

}
</style>
