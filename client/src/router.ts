import { createRouter, createWebHistory } from 'vue-router';
import SearchView from './views/SearchView.vue';
import MapView from './views/MapView.vue';

const routes = [
  {
    path: '/',
    component: SearchView,
  },
  {
    path: '/map',
    component: MapView,
  },
  {
    path: '/learn-more',
    component: MapView,
  },
  {
    path: '/contact',
    component: MapView,
  },
];

/** Defines all routes for the app **/
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
