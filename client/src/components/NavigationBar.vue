<template>
  <div :style="cssVars" class="container">
    <div>
      <router-link to="/">
        <img src="../assets/logo.png" class="logo" />
      </router-link>
    </div>
    <div class="right-align">
      <div v-for="route in routes" :key="route[0]">
        <router-link :to="route[1]" class="semi-bold">{{ route[0] }}</router-link>
      </div>
    </div>
  </div>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ABOUT_TITLE, MAP_TITLE } from '../assets/messages/common';
import { ABOUT_ROUTE, MAP_ROUTE } from '../router';

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
      [MAP_TITLE, MAP_ROUTE],
      [ABOUT_TITLE, ABOUT_ROUTE],
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
