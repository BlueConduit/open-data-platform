<template>
  <resources-page-section :styles='styles.DEFAULT_STYLE'
                          :content='content.FILTER_TYPES_SECTION'>
    <div class='filter-cards'>
      <image-card v-for='filter in content.FILTER_TYPES'
                  :key='filter.header'
                  :content='filter'
                  :image='filter.image'></image-card>
    </div>
  </resources-page-section>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import ResourcesPageSection from './ResourcesPageSection.vue';
import { ResourcesPageContent as content } from '@/assets/messages/resources';
import { ResourcesPageStyles as styles } from '../../assets/styles/style_props';
import ImageCard from '../ImageCard.vue';

/**
 * Content for filter types section of the resources page.
 */
export default defineComponent({
  name: 'FilterTypesSection',
  components: {
    ImageCard,
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
.filter-cards {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;

  width: 852px;
  height: 903px;
}
</style>