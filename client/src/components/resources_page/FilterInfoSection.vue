<template>
  <resources-page-section
    :message='messages.WATER_FILTER_INFO_SECTION'
    :styles='styles.DEFAULT_STYLE'>
    <div class='filter-static-content'>
    <span class='asset'><img
      :src='require(`@/assets/media/${messages.WATER_FILTER_INFO_SECTION.image}`)'
      alt=''></span>
      <span class='filter-text'>
      {{ messages.WATER_FILTER_INFO_SECTION.body }}
    </span>
    </div>
  </resources-page-section>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ResourcesPageMessages as messages } from '../../assets/messages/resources';
import { ResourcesPageStyles as styles } from '../../assets/styles/resources';
import ResourcesPageSection from './ResourcesPageSection.vue';

export default defineComponent({
  name: 'FilterInfoSection',
  components: {
    ResourcesPageSection,
  },
  data() {
    return {
      messages,
      styles,
    };
  },
});
</script>

<style scoped>

.asset img {
  height: 472px;
  width: 494px;
}

.filter-static-content {
  width: 932px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.2px;
  margin-top: 24px;
  gap: 38px;
}

.filter-text {
  width: 324px;
  height: 170px;
  padding: 0 60px 0 0;

  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 34px;

  /*!* Warm Grey/Warm Grey 600 *!*/
  color: #7A7A7A;
}
</style>