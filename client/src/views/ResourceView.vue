<template>
<!--  TODO refactor slot content into components-->
  <div>
    <static-page-section
      :message='messages.WATER_FILTER_INFO_SECTION'
      :styles='DEFAULT_STYLE'>
      <div class='static-content'>
        <span class='asset'><img
          :src='require(`@/assets/media/resource-image-1.png`)'
          alt=''></span>
        <span
          class='text'>{{ messages.WATER_FILTER_INFO_SECTION.body
          }}</span>
      </div>
    </static-page-section>
    <static-page-section :styles='DEFAULT_STYLE'
                         :message='messages.FILTER_TYPES_SECTION'>
      <div class='filter-cards'>
        <image-card v-for='filter in messages.FILTER_TYPES'
                    :key='filter.header'
                    :message='filter'></image-card>
      </div>
    </static-page-section>
    <static-page-section :styles='RECOMMENDATIONS_STYLE'
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
import StaticPageSection, { Styles } from '../components/StaticPageSection.vue';
import ImageCard from '../components/ImageCard.vue';
import { ResourcesPageMessages as messages } from '../assets/messages/resources';

const DEFAULT_STYLE: Styles = {
  BACKGROUND_COLOR: '#FFFFFF', // White.
  HEADER_TEXT_COLOR: '#464646',
  SUB_HEADER_TEXT_COLOR: '#252525',
};

const RECOMMENDATIONS_STYLE: Styles = {
  BACKGROUND_COLOR: '#05A8F4', // Light blue.
  HEADER_TEXT_COLOR: '#FFFFFF',
  SUB_HEADER_TEXT_COLOR: '#FFFFFF',
};

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
      DEFAULT_STYLE,
      RECOMMENDATIONS_STYLE,
    };
  },
});
</script>

<style scoped>

a {
  text-decoration: none;
}

.static-content {
  width: 932px;
  display: flex;
  align-items: center;
  letter-spacing: 0.2px;
  text-transform: capitalize;
  margin-top: 24px;
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

.text {
  padding: 0 110px 0 38px;
  width: 290px;
  height: 204px;

  /* Headline 2 */
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 34px;
  /* or 142% */
  display: flex;
  align-items: center;

  /* Warm Grey/Warm Grey 600 */
  color: #7A7A7A;


  /* Inside auto layout */
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;

}
</style>
