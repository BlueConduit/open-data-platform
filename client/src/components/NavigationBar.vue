<template>
  <div :style='cssVars' class='container'>
    <div>
      <router-link to='/'>
        <img src='../assets/logo.png' class='logo' />
      </router-link>
    </div>
    <div class='right-align'>
      <div>
        <router-link to="/" class="semi-bold">My Water Score</router-link>
      </div>
      <div>
        <router-link to="/map" class="semi-bold">Nationwide Lead Map</router-link>
      </div>
    </div>
  </div>
  <router-view />
</template>

<script lang='ts'>
import { defineComponent } from 'vue';

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
