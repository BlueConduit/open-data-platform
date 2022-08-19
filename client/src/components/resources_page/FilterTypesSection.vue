<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h1-header-large'>
        {{ content.FILTER_TYPES_SECTION.header }}
      </div>
      <div class='h2-header-large'>
        {{ content.FILTER_TYPES_SECTION.subHeader }}
      </div>
    </div>
    <div class='filter-cards'>
      <image-card v-for='filter in content.FILTER_TYPES'
                  :key='filter.header'
                  :content='filter'
                  :image='filter.image'></image-card>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ResourcesPageContent as content } from '@/assets/messages/resources';
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
      content,
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