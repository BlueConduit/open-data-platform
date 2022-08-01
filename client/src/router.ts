import { createRouter, createWebHistory } from 'vue-router';
import MapContentContainer from './components/MapContentContainer.vue';

const HOME_ROUTE = '/';
const MAP_ROUTE = '/map';
const CONTACT_ROUTE = '/contact';

const routes = [
  {
    path: HOME_ROUTE,
    component: MapContentContainer,
    meta: {
      title: 'LeadOut - Home',
    },
  },
  {
    path: MAP_ROUTE,
    component: MapContentContainer,
    meta: {
      title: 'LeadOut - Nationwide Lead Map',
    },
  },
  {
    path: CONTACT_ROUTE,
    component: MapContentContainer,
    meta: {
      title: 'LeadOut - Contact Us',
    },
  },
];

/** Defines all routes for the app **/
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export { router, HOME_ROUTE, MAP_ROUTE, CONTACT_ROUTE };
