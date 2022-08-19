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
      <span class='h1-header'>
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

<style scoped lang='scss'>
@import '../../assets/styles/global.scss';

.asset img {
  height: 472px;
  width: 494px;
}

.filter-static-content {
  @include container-row;
  @include center-container;
  width: 932px;
  letter-spacing: 0.2px;
  margin-top: 24px;
  gap: 38px;
}

.h1-header {
  width: 324px;
  height: 170px;
  padding: 0 60px 0 0;
  color: $warm-grey-600;
}
</style>