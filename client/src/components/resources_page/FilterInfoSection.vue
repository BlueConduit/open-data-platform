<template>
  <resources-page-section
    :content='content.WATER_FILTER_INFO_SECTION'
    :styles='styles.DEFAULT_STYLE'>
    <div class='filter-static-content'>
    <span class='asset'><img
      :src='require(`@/assets/media/${content.WATER_FILTER_INFO_SECTION.image}`)'
      alt=''></span>
      <span class='filter-text'>
      {{ content.WATER_FILTER_INFO_SECTION.body }}
    </span>
    </div>
  </resources-page-section>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ResourcesPageContent as content } from '../../assets/messages/resources';
import { ResourcesPageStyles as styles } from '../../assets/styles/style_props';
import ResourcesPageSection from './ResourcesPageSection.vue';

/**
 * Content for filter info section of the resources page.
 */
export default defineComponent({
  name: 'FilterInfoSection',
  components: {
    ResourcesPageSection,
  },
  data() {
    return {
      content,
      styles,
    };
  },
});
</script>

<style scoped>

.asset img {
  height: 300px;
  /*width: 494px;*/
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

  /*!* Warm Grey/Warm Grey 600 *!*/
  color: #7A7A7A;
}
</style>