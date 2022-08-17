<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h2-header-large'>{{ messages.RESOURCES_SECTION_SUPER_HEADER }}
      </div>
      <div class='h1-header-large'>{{ messages.RESOURCES_SECTION_HEADER }}</div>
    </div>
    <div class='resources'>
      <div class='resource-blurb'
           v-for='resource in messages.RESOURCE_MESSAGES'
           :key='resource.header'>
        <div class='h1-header'>{{ resource.header }}</div>
        <div class='resource body'>{{ resource.body }}</div>
      </div>
    </div>
    <router-link class='link' :to='resourcesRoute'>
      {{ messages.VIEW_MORE_RESOURCES_BUTTON_TEXT }}
    </router-link>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { LandingPageMessages as messages } from '@/assets/messages/landing';
import { RESOURCES_ROUTE } from '../../router';

/**
 * Content for resources section of the landing page.
 */
export default defineComponent({
  name: 'ResourcesSection',
  data() {
    return {
      messages,
      resourcesRoute: RESOURCES_ROUTE,
    };
  },
});
</script>

<style scoped lang='scss'>
@import '../../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.h2-header-large {
  color: $warm-grey-600;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
}

.resource {
  line-height: 22px;
  text-align: center;
  color: $warm-grey-800;
}

.resource-blurb {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  gap: $spacing-md;
  padding: 2 * $spacing-xs;
  width: 75 * $spacing-xs;
  height: 45 * $spacing-xs;
}

.h1-header {
  text-align: center;
  color: $warm-grey-900;
  text-transform: capitalize;
}

.resources {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 6 * $spacing-xs;
}

.section {
  padding: 18 * $spacing-xs 8 * $spacing-xs;
  background-color: $light-blue-50;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12 * $spacing-xs;
}
</style>