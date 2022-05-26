import { createRouter, createWebHistory } from 'vue-router';
import MapContentContainer from './components/MapContentContainer.vue';

/** Defines all routes for the app **/
export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MapContentContainer,
    },
    {
      path: '/learn-more',
      component: MapContentContainer,
    },
    {
      path: '/contact',
      component: MapContentContainer,
    },
  ]
})
