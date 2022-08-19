<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h1-header-large'>
        {{ messages.WATER_FILTER_INFO_SECTION_HEADER }}
      </div>
      <div class='h2-header-large'>
        {{ messages.WATER_FILTER_INFO_SECTION_SUBHEADER }}
      </div>
    </div>
    <div class='filter-static-content'>
    <span class='asset'><img
      :src='require(`@/assets/media/resource-image-1.png`)'
      alt=''></span>
      <span class='filter-text'>
      {{ messages.WATER_FILTER_DESCRIPTION }}
    </span>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ResourcesPageMessages as messages } from '../../assets/messages/resources';

/**
 * Content for filter info section of the resources page.
 */
export default defineComponent({
  name: 'FilterInfoSection',
  data() {
    return {
      messages,
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