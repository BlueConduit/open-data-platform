<template>
  <div class='section'>
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