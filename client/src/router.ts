import { createRouter, createWebHistory } from 'vue-router';
import LandingPageView from './views/LandingPageView.vue';
import MapView from './views/MapView.vue';

const HOME_ROUTE = '/';
const MAP_ROUTE = '/map';
const CONTACT_ROUTE = '/contact';

const routes = [
  {
    path: HOME_ROUTE,
    component: LandingPageView,
    meta: {
      title: 'LeadOut - Home',
    },
  },
  {
    path: MAP_ROUTE,
    component: MapView,
    meta: {
      title: 'LeadOut - Nationwide Lead Map',
    },
  },
];

/** Defines all routes for the app **/
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export { router, HOME_ROUTE, MAP_ROUTE, CONTACT_ROUTE };
