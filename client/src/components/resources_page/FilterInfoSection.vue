<template>
  <div class='section center-container has-text-centered'>
    <div class='header-section'>
      <div class='h1-header-large'>
        {{ messages.WATER_FILTER_INFO_SECTION_HEADER }}
      </div>
      <div class='h2-header-large'>
        {{ messages.WATER_FILTER_INFO_SECTION_SUBHEADER }}
      </div>
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

.section.has-text-centered {
  @include background-image-gradient(rgba(4, 86, 155, 0.75), url('~@/assets/media/resource-image-1.png'));
  color: $white;
}

.asset img {
  height: auto;
  max-width: 475px;
}

.h1-header {
  max-width: 325px;
  color: $warm-grey-600;
}
</style>