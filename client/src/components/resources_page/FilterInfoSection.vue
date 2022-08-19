<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h1-header-large'>
        {{ content.WATER_FILTER_INFO_SECTION.header }}
      </div>
      <div class='h2-header-large'>
        {{ content.WATER_FILTER_INFO_SECTION.subHeader }}
      </div>
    </div>
    <div class='filter-static-content'>
    <span class='asset'><img
      :src='require(`@/assets/media/${content.WATER_FILTER_INFO_SECTION.image}`)'
      alt=''></span>
      <span class='filter-text'>
      {{ content.WATER_FILTER_INFO_SECTION.body }}
    </span>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ResourcesPageContent as content } from '../../assets/messages/resources';

/**
 * Content for filter info section of the resources page.
 */
export default defineComponent({
  name: 'FilterInfoSection',
  data() {
    return {
      content,
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