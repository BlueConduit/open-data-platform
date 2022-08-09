<template>
  <div>
    <static-page-section :messages='messages.WaterFilterInfo'
                         :styles='STYLES'>
      <div class='static-content'>
        <span class='asset'><img :src='require(`@/assets/media/${image}`)'
                                 alt=''></span>
        <span>{{ messages.WaterFilterInfo.BODY }}</span>
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
  font-weight: 500;
  font-size: 32px;
  line-height: 48px;
  /* or 150% */
  display: flex;
  align-items: center;
  letter-spacing: 0.2px;
  text-transform: capitalize;

  /* Warm Grey/Warm Grey 900 */
  color: #252525;
}

.asset img {
  height: 472px;
  width: 652px;
}
</style>
