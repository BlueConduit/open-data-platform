<template>
  <div>
    <div :style='cssVars' class='container'>
      <div>
        <router-link to='/'>
          <img src='../assets/logo.png' class='logo' />
        </router-link>
      </div>
      <div class='right-align'>
        <div v-for='route in routes' :key='route[0]'>
          <router-link :to='route[1]' class='semi-bold'>{{ route[0] }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { Titles } from '../assets/messages/common';
import * as router from '../router';

export default defineComponent({
  name: 'NavigationBar',
  props: {
    bgColor: {
      type: String,
      default: '#0b2553',
    },
    textColor: {
      type: String,
      default: '#fff',
    },
    height: {
      type: Number,
      default: 50,
    },
  },
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
  computed: {
    cssVars() {
      return {
        '--bg-color': this.bgColor,
        '--text-color': this.textColor,
        '--height': `${this.height + 'px'}`,
      };
    },
  },
});
</script>

<style scoped>
.container {
  background-color: var(--bg-color);
  display: flex;
  height: var(--height);
}

.right-align {
  flex-grow: 1;
  justify-content: flex-end;
}

.container div {
  padding: 0 30px;
  display: flex;
  align-items: center;
}

.logo {
  height: var(--height);
}

a {
  color: var(--text-color);
  text-decoration: none;
}
</style>
