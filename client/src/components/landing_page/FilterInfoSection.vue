<template>
  <div class='section is-small'>
    <div class='columns is-centered has-text-centered'>
      <div class='column is-two-thirds'>
        <div class='header-section'>
          <div class='h2-header-large'>
            {{ messages.CHOOSING_FILTER_SECTION_SUPER_HEADER }}
          </div>
          <div class='h1-header-large'>
            {{ messages.CHOOSING_FILTER_SECTION_HEADER }}
          </div>
          <div class='h2-header-large'>
            {{ messages.CHOOSING_FILTER_SECTION_SUBHEADER }}
          </div>
        </div>
        <button class='grey-button' @click='navigateToResources'>
          {{ messages.LEARN_MORE_BUTTON_TEXT }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { LandingPageMessages as messages } from '../../assets/messages/landing';
import { router } from '../../router';

/**
 * Content for filter info section of the landing page.
 */
export default defineComponent({
  name: 'FilterInfoSection',
  data() {
    return {
      messages,
    };
  },
  methods: {
    navigateToResources(): void {
      router.push({
        path: '/resources',
      });
    },
  },
});
</script>

<style scoped lang="scss">
@import '../../assets/styles/global.scss';
@import '@blueconduit/copper/scss/01_settings/design-tokens';
@import 'bulma/sass/layout/section.sass';
@import 'bulma/sass/grid/columns.sass';
@import 'bulma/sass/helpers/typography.sass';

.section {
  background-color: $light-blue;
  color: $white;
}

.h2-header-large {
  margin-bottom: $spacing-lg;
}
</style>
