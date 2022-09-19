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
      :src='require(`../../assets/media/resource-image-1.png`)'
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
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.asset img {
  height: auto;
  max-width: 475px;
}

.filter-static-content {
  @include container-row;
  @include center-container;
  gap: $spacing-lg;
}

.h1-header {
  max-width: 325px;
  color: $warm-grey-600;
}
</style>