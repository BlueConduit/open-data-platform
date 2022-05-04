<template>
  <NavigationBar/>
</template>

<script>
import "@blueconduit/copper/dist/css/copper.css";
import NavigationBar from './components/NavigationBar.vue'

/**
 * Entry point for the open platform application.
 */
export default {
  name: 'App',
  components: {
    NavigationBar
  }
}
</script>
<style>
  @import "./assets/styles/global.scss";
</style>