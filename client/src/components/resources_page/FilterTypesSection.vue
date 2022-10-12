<template>
  <div class='section center-container'>
    <div class='header-section'>
      <div class='h1-header-large'>
        {{ messages.FILTER_TYPES_SECTION_HEADER }}
      </div>
      <div class='h2-header-large'>
        {{ messages.FILTER_TYPES_SECTION_SUBHEADER }}
      </div>
    </div>
    <div class='filter-cards'>
      <image-card v-for='filter in messages.FILTER_TYPES'
                  :key='filter.header'
                  :header='filter.header'
                  :image='filter.image'></image-card>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ResourcesPageMessages as messages } from '@/assets/messages/resources';
import ImageCard from '../ImageCard.vue';

/**
 * Content for filter types section of the resources page.
 */
export default defineComponent({
  name: 'FilterTypesSection',
  components: {
    ImageCard,
  },
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

.filter-cards {
  @include container-row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 850px;
}
</style>