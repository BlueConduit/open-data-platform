<template>
  <div class='footer page-footer'>
    <div class='columns'>
      <div class='column is-three-quarters px-6'>
        <div v-for='route in routes' :key='route[0]'>
          <router-link :to='route[1]'>{{ route[0] }}</router-link>
        </div>
      </div>
      <div class='column bottom-align'>
        <a class='image is-3by1' href='https://blueconduit.com/'>
          <img src='../assets/bc-logo.png' />
        </a>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
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

<style scoped lang='scss'>
@import '@blueconduit/copper/scss/01_settings/design-tokens';
@import 'bulma/sass/layout/footer.sass';
@import 'bulma/sass/elements/image.sass';
@import 'bulma/sass/utilities/_all.sass';

.page-footer {
  background-color: $secondary01;
}

.bottom-align {
  margin-top: auto;
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
