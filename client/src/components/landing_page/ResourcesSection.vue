<template>
  <div class='section'>
    <div class='header-section'>
      <div class='h2-header-large'>{{ messages.RESOURCES_SECTION_SUPER_HEADER }}
      </div>
      <div class='h1-header-large'>{{ messages.RESOURCES_SECTION_HEADER }}</div>
    </div>
    <div class='resources'>
      <div class='resource'
           v-for='resource in messages.RESOURCE_MESSAGES'
           :key='resource.header'>
        <div class='h1-header'>{{ resource.header }}</div>
        <div class='resource-blurb body'>{{ resource.body }}</div>
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

.resource {
  @include container-column;
  gap: $spacing-md;
  padding: $spacing-sm;
  max-width: 300px;
  max-height: 300px;

}

.resource-blurb {
  color: $warm-grey-800;
  text-align: center;
}

.h1-header {
  color: $warm-grey-900;
  text-transform: capitalize;
}

.resources {
  @include container-row;
  @include center-container;
  align-items: flex-start;
  gap: $spacing-md;
}

.section {
  background-color: $light-blue-50;
}
</style>