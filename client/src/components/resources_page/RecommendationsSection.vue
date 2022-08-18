<template>
  <resources-page-section :styles='styles.RECOMMENDATIONS_STYLE'
                          :content='content.RECOMMENDATIONS_SECTION'>
    <div class='recommendations-content'>
      <div v-for='rec in content.RECOMMENDATIONS'
           :key='rec.url'>
        <div class='recommendation-title'>{{ rec.header }}</div>
        <a class='recommendation-link' :href='rec.url'>{{ rec.linkText }}</a>
      </div>
    </div>
  </resources-page-section>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import ResourcesPageSection from './ResourcesPageSection.vue';
import { ResourcesPageContent as content } from '@/assets/messages/resources';
import { ResourcesPageStyles as styles } from '../../assets/styles/style_props';

/**
 * Content for recommendations section of the resources page.
 */
export default defineComponent({
  name: 'RecommendationsSection',
  components: {
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
a {
  text-decoration: none;
}

.recommendations-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 83px 61px;
  gap: 30px;

  background-color: #FFFFFF;
  height: fit-content;
  width: 912px;
  border-radius: 16px;
}

.recommendation-title {
  font-weight: 500;
  font-size: 20px;
  line-height: 30px;
  color: #464646;
  font-family: 'IBM Plex Sans';
}

.recommendation-link {
  font-weight: 500;
  font-size: 32px;
  line-height: 40px;
  color: #2553A0;
  font-family: 'IBM Plex Sans';
}
</style>