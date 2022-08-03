import { createRouter, createWebHistory } from 'vue-router';
import { Titles } from './assets/messages/common';
import MapView from './views/MapView.vue';

export const LAT_LONG_PARAM = 'latlong';

const HOME_ROUTE = '/';
const MAP_ROUTE = `/map/:${LAT_LONG_PARAM}?`;
const CONTACT_ROUTE = '/contact';

const routes = [
  {
    path: HOME_ROUTE,
    component: MapView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.HOME_TITLE}`,
    },
  },
  {
    path: MAP_ROUTE,
    component: MapView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.MAP_TITLE}`,
    },
  },
  {
    path: CONTACT_ROUTE,
    component: MapView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.CONTACT_TITLE}`,
    },
  },
];

/** Defines all routes for the app **/
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export { router, HOME_ROUTE, MAP_ROUTE, CONTACT_ROUTE };
