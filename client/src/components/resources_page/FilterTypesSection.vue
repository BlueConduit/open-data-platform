<template>
  <resources-page-section :styles='styles.DEFAULT_STYLE'
                          :message='messages.FILTER_TYPES_SECTION'>
    <div class='filter-cards'>
      <image-card v-for='filter in messages.FILTER_TYPES'
                  :key='filter.header'
                  :message='filter'
                  :image='filter.image'></image-card>
    </div>
  </resources-page-section>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import ResourcesPageSection from './ResourcesPageSection.vue';
import { ResourcesPageMessages as messages } from '@/assets/messages/resources';
import { ResourcesPageStyles as styles } from '@/assets/styles/resources';
import ImageCard from '../ImageCard.vue';

export default defineComponent({
  name: 'FilterTypesSection',
  components: {
    ImageCard,
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
.filter-cards {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;

  width: 852px;
  height: 903px;
}
</style>