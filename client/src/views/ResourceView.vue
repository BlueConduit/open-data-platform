<template>
<!--  TODO refactor slot content into components-->
  <div class='content'>
    <static-page-section
      :message='messages.WATER_FILTER_INFO_SECTION'
      :styles='styles.DEFAULT_STYLE'>
      <div class='filter-static-content'>
        <span class='asset'><img
          :src='require(`@/assets/media/resource-image-1.png`)'
          alt=''></span>
        <span
          class='filter-text'>{{ messages.WATER_FILTER_INFO_SECTION.body
          }}
        </span>
      </div>
    </static-page-section>
    <static-page-section :styles='styles.DEFAULT_STYLE'
                         :message='messages.FILTER_TYPES_SECTION'>
      <div class='filter-cards'>
        <image-card v-for='filter in messages.FILTER_TYPES'
                    :key='filter.header'
                    :message='filter'
                    :image='filter.image'></image-card>
      </div>
    </static-page-section>
    <static-page-section :styles='styles.RECOMMENDATIONS_STYLE'
                         :message='messages.RECOMMENDATIONS_SECTION'>
      <div class='recommendations-content'>
        <div v-for='rec in messages.RECOMMENDATIONS'
             :key='rec.url'>
          <div class='recommendation-title'>{{ rec.title }}</div>
          <a class='recommendation-link' :href='rec.url'>{{ rec.linkText }}</a>
        </div>
      </div>
    </static-page-section>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import StaticPageSection from '../components/StaticPageSection.vue';
import ImageCard from '../components/ImageCard.vue';
import { ResourcesPageMessages as messages } from '../assets/messages/resources';
import { ResourcesPageStyles as styles } from '../assets/styles/resources';

/**
 * Container for SearchBar and MapContainer.
 */
export default defineComponent({
  name: 'ResourceView',
  components: {
    StaticPageSection,
    ImageCard,
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

a {
  text-decoration: none;
}

.content {
  margin-top: 109px;
}

.filter-static-content {
  width: 932px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.2px;
  margin-top: 24px;
  gap: 38px;
}

.asset img {
  height: 472px;
  width: 494px;
}

.filter-cards {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;

  width: 852px;
  height: 903px;
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

.filter-text {
  width: 324px;
  height: 170px;
  padding: 0 60px 0 0;

  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 34px;

  /*!* Warm Grey/Warm Grey 600 *!*/
  color: #7A7A7A;
}
</style>
