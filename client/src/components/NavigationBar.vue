<template>
  <div>
    <div class='container'>
      <div>
        <router-link to='/'>
          <img src='../assets/lo-logo.png' class='logo' />
        </router-link>
      </div>
      <div class='right-align'>
        <div v-for='route in routes' class='nav-link' :key='route[0]'>
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
  name: 'NavigationBar',
  data() {
    const routes: [string, string][] = [
      [Titles.HOME_TITLE, router.HOME_ROUTE],
      [Titles.LEAD_STATUS_TITLE, router.SCORECARD_BASE],
      [Titles.MAP_TITLE, router.MAP_ROUTE_BASE],
      [Titles.ABOUT_TITLE, router.ABOUT_ROUTE],
      [Titles.RESOURCES_TITLE, router.RESOURCES_ROUTE],
    ];
    return {
      routes,
    };
  },
});
</script>

<style scoped lang="scss">
@import '@blueconduit/copper/scss/01_settings/design-tokens';

.container {
  background-color: $white_background;
  box-shadow: $card-shadow-hovered;
  display: flex;
  height: $spacing-xl;
  padding-left: $spacing-xl;
  padding-right: $spacing-xl;
}

.right-align {
  flex-grow: 1;
  justify-content: flex-end;
}

.container div {
  display: flex;
  align-items: center;
}

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
