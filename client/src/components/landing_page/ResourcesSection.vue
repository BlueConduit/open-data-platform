<template>
  <div class='section is-medium'>
    <!-- <div class='hero-body'> -->
    <div class='container'>
      <div class='columns is-centered has-text-centered'>
        <div class='column header-section'>
          <div class='h2-header-large'>{{ messages.RESOURCES_SECTION_SUPER_HEADER }}</div>
          <div class='h1-header-large'>{{ messages.RESOURCES_SECTION_HEADER }}</div>
        </div>
      </div>
      <div class='columns is-centered has-text-centered'>
        <div class='column' v-for='resource in messages.RESOURCE_MESSAGES' :key='resource.header'>
          <div class='h1-header'>{{ resource.header }}</div>
          <div class='resource-blurb body'>{{ resource.body }}</div>
        </div>
      </div>
      <div class='columns is-centered has-text-centered'>
        <div class='column header-section'>
          <router-link class='gold-button' :to='resourcesRoute'>
            {{ messages.VIEW_MORE_RESOURCES_BUTTON_TEXT }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { LandingPageMessages as messages } from '../../assets/messages/landing';
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

<style scoped lang="scss">
@import '../../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';
@import 'bulma/sass/layout/section.sass';
@import 'bulma/sass/elements/container.sass';
@import 'bulma/sass/grid/columns.sass';
@import 'bulma/sass/helpers/typography.sass';
@import 'bulma/sass/utilities/_all.sass';

.h2-header-large {
  color: $warm-grey-600;
  margin-bottom: $spacing-lg;
}

.resource-blurb {
  color: $warm-grey-800;
  text-align: center;
}

.h1-header {
  @include centered-text;

  color: $warm-grey-900;
  text-transform: capitalize;
}

.section {
  background-color: $light-blue-50;
}
</style>
