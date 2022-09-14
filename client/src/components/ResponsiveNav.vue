<template>
  <div class='navbar is-spaced has-shadow'>
    <div class='navbar-brand'>
      <router-link class='navbar-item' to='/'>
        <img src='../assets/lo-logo.png' class='logo' />
      </router-link>
      <a role='button' class='navbar-burger' aria-label='menu' aria-expanded='false'>
        <span aria-hidden='true'></span>
        <span aria-hidden='true'></span>
        <span aria-hidden='true'></span>
      </a>
    </div>
    <div class='navbar-menu'>
      <div class='navbar-end'>
        <div v-for='route in routes' class='navbar-item nav-link' :key='route[0]'>
          <router-link :to='route[1]'>{{ route[0] }} </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Titles } from '../assets/messages/common';
import * as router from '../router';

export default defineComponent({
  name: 'ResponsiveNav',
  data() {
    const routes: [string, string][] = [
      [Titles.HOME_TITLE, router.HOME_ROUTE],
      [Titles.LEAD_STATUS_TITLE, router.SCORECARD_BASE],
      [Titles.MAP_TITLE, router.MAP_ROUTE_BASE],
      [Titles.ABOUT_TITLE, router.ABOUT_ROUTE],
      // TODO: Re-add the resources link once we have a resources page in Wordpress.
      // [Titles.RESOURCES_TITLE, router.RESOURCES_ROUTE],
    ];
    return {
      routes,
    };
  },
  mounted() {
    // Expand the menu via the burger button
    document.querySelectorAll('.navbar-burger').forEach((burger) => {
      burger.addEventListener('click', () => {
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        burger.classList.toggle('is-active');
        document
          .querySelectorAll('.navbar-menu')
          .forEach((menu) => menu.classList.toggle('is-active'));
      });
    });
  },
});
</script>

<style scoped lang="scss">
@import '@blueconduit/copper/scss/01_settings/design-tokens';
@import 'bulma/sass/form/_all.sass'; // Needed for some reason to import the below.
@import 'bulma/sass/utilities/extends.sass';
@import 'bulma/sass/components/navbar.sass';

.logo {
  height: $spacing-lg;
}

.nav-link {
  padding: $spacing-md;
}

.nav-link a {
  color: $text_inactive;
  text-decoration: none;
}

a:hover {
  color: $text_link;
  // Maintains text width while adding a bold font weight.
  -webkit-text-stroke-width: 0.7px;
  -webkit-text-stroke-color: $text_link;
}
</style>
