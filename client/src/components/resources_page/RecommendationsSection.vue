<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h1-header-large'>
        {{ content.RECOMMENDATIONS_SECTION.header }}
      </div>
      <div class='h2-header-large'>
        {{ content.RECOMMENDATIONS_SECTION.subHeader }}
      </div>
    </div>
    <div class='recommendations-content'>
      <div v-for='rec in content.RECOMMENDATIONS'
           :key='rec.url'>
        <div class='recommendation-title'>{{ rec.header }}</div>
        <a class='recommendation-link' :href='rec.url'>{{ rec.linkText }}</a>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ResourcesPageContent as content } from '@/assets/messages/resources';

/**
 * Content for recommendations section of the resources page.
 */
export default defineComponent({
  name: 'RecommendationsSection',
  data() {
    return {
      content,
    };
  },
});
</script>

<style scoped lang='scss'>
@import '../../assets/styles/global.scss';

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
}

.recommendation-link {
  font-weight: 500;
  font-size: 32px;
  line-height: 40px;
  color: #2553A0;
}

.section {
  background-color: $light-blue;
  color: $white;
}
</style>