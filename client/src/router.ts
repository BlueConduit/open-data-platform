import { createRouter, createWebHistory } from 'vue-router';
import MapContentContainer from './components/MapContentContainer.vue';

const routes = [
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
];

/** Defines all routes for the app **/
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
