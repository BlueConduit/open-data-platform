<template>
  <NavigationBar/>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import "@blueconduit/copper/dist/css/copper.css";
import NavigationBar from './components/NavigationBar.vue'

export default defineComponent({
  name: 'App',
  components: {
    NavigationBar
  }
});
</script>
<style>
@import "./assets/styles/global.scss";
</style>