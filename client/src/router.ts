import { createRouter, createWebHistory } from 'vue-router';
import LandingPageView from './views/LandingPageView.vue';
import MapView from './views/MapView.vue';

const routes = [
  {
    path: '/',
    component: LandingPageView,
  },
  {
    path: '/map',
    component: MapView,
  },
];

/** Defines all routes for the app **/
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
