<template>
  <div class='section center-container'>
    <div class='header-section'>
      <div class='h1-header-large'>
        {{ messages.RECOMMENDATIONS_SECTION_HEADER }}
      </div>
      <div class='h2-header-large'>
        {{ messages.RECOMMENDATIONS_SECTION_SUBHEADER }}
      </div>
    </div>
    <div class='recommendations-content'>
      <div v-for='rec in messages.RECOMMENDATIONS'
           :key='rec.url'>
        <div class='h2-header-large recommendation-title'>{{ rec.header }}</div>
        <a class='recommendation-link' :href='rec.url'>{{ rec.linkText }}</a>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { ResourcesPageMessages as messages } from '@/assets/messages/resources';

/**
 * Content for recommendations section of the resources page.
 */
export default defineComponent({
  name: 'RecommendationsSection',
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

a {
  text-decoration: none;
}

.section {
  background-color: $faint-grey;
}

.recommendations-content {
  @include container-column;
  align-items: flex-start;
  padding: $spacing-xl;
  gap: $spacing-lg;

  background-color: $white;
  border-radius: $spacing-md;
}

.recommendation-title {
  color: $warm-grey-800;
  text-align: start;
}

.recommendation-link {
  font-weight: 500;
  font-size: 32px;
  line-height: 40px;
  color: $navy-blue;
}

</style>