<template>
  <div :style="cssVars" class="container">
    <div>
      <router-link to="/" >
        <img src="../assets/logo.png" class="logo"/>
      </router-link>
    </div>
    <div class="right-align">
      <div>
        <router-link to="/learn-more" class="semi-bold">About</router-link>
      </div>
      <div>
        <router-link to="/contact" class="semi-bold">Contact</router-link>
      </div>
    </div>
  </div>
  <router-view/>
</template>

<script>
export default {
  name: 'NavigationBar',
  props: {
    bgColor: {
      type: String,
      default: "#0b2553"
    },
    textColor: {
      type: String,
      default: "#fff"
    },
    height: {
      type: Number,
      default: 50
    },
  },
  computed: {
    cssVars() {
      return {
        '--bg-color': this.bgColor,
        '--text-color': this.textColor,
        '--height': `${this.height + 'px'}`
      }
    }
  }
}
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

  .container  div {
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
