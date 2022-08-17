<template>
  <LandingPageSection class='section'
                      :messages='messages.ResourcesInfo'
                      :styles='styles.RESOURCES_SECTION_STYLE'>
    <div class='resources'>
      <div class='resource-blurb'
           v-for='resource in RESOURCE_MESSAGES'
           :key='resource.header'>
        <div class='resource-header'>{{ resource.header }}</div>
        <div class='resource-body'>{{ resource.body }}</div>
      </div>
    </div>
    <router-link class='link' :to='resourcesRoute'>
      {{ messages.ResourcesInfo.CTA_BUTTON }}
    </router-link>
  </LandingPageSection>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import LandingPageSection from './LandingPageSection.vue';
import * as messages from '../../assets/messages/landing';
import { RESOURCE_MESSAGES } from '../../assets/messages/landing';
import { RESOURCES_ROUTE } from '../../router';
import { LandingPageStyles as styles } from '@/assets/styles/style_props';

/**
 * Content for resources section of the landing page.
 */
export default defineComponent({
  name: 'ResourcesSection',
  components: {
    LandingPageSection,
  },
  data() {
    return {
      messages,
      styles,
      RESOURCE_MESSAGES,
      resourcesRoute: RESOURCES_ROUTE,
    };
  },
});
</script>

<style scoped>
.link {
  font-size: 18px;
  color: #2553A0;
}

.resource-body {
  font-size: 16px;
  line-height: 22px;
  font-weight: 400;
  text-align: center;
  color: #464646;
}

.resource-blurb {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  gap: 16px;
  padding: 10px;
  width: 301px;
  height: 180px;
}

.resource-header {
  font-size: 24px;
  font-weight: 400;
  line-height: 34px;
  text-align: center;
  color: #212121;
  text-transform: capitalize;
}

.resources {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 26px;
}

.section {
  padding: 72px 33px;
}
</style>