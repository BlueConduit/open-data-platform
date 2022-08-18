<template>
  <div class='page-footer'>
    <div class='left-align'>
      <div v-for='route in routes' :key='route[0]'>
        <router-link :to='route[1]'>{{ route[0] }}</router-link>
      </div>
    </div>
    <div class='right-align'>
      <a class='logo' href='https://blueconduit.com/'>
        <img src='../assets/bc-logo.png' class='logo' />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Titles } from '../assets/messages/common';
import * as router from '../router';

/**
 * The navigational footer for the landing page.
 */
export default defineComponent({
  name: 'PageFooter',
  data() {
    const routes: [string, string][] = [
      [Titles.HOME_TITLE, router.HOME_ROUTE],
      [Titles.MAP_TITLE, router.MAP_ROUTE_BASE],
      [Titles.ABOUT_TITLE, router.ABOUT_ROUTE],
    ];
    return {
      routes,
    };
  },
});
</script>

<style scoped lang="scss">
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.page-footer {
  background-color: $secondary01;
  display: flex;
  width: 100%;
}

.left-align {
  padding: $spacing-xl;
  flex-grow: 1;
}

.right-align {
  padding: $spacing-lg;
  flex-grow: 1;
  justify-content: flex-end;
  text-align: right;
  bottom: 0;
}

.logo {
  height: 80px;
}

a {
  color: $text_white;
  text-decoration: none;
  line-height: 2.5;
}
</style>
