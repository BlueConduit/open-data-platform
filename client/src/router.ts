import { createRouter, createWebHistory } from 'vue-router';
import LandingPageView from './views/LandingPageView.vue';
import MapView from './views/MapView.vue';
import { Titles } from './assets/messages/common';

export const LAT_LONG_PARAM = 'latlong';

const HOME_ROUTE = '/';
const SCORECARD_BASE = `/scorecard`;
const SCORECARD_ROUTE = `${SCORECARD_BASE}/:${LAT_LONG_PARAM}?`;
const MAP_ROUTE_BASE = `/map`;
const MAP_ROUTE = `${MAP_ROUTE_BASE}/:${LAT_LONG_PARAM}?`;
const ABOUT_ROUTE = '/about';

const routes = [
  {
    path: HOME_ROUTE,
    component: LandingPageView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.HOME_TITLE}`,
    },
  },
  {
    path: SCORECARD_BASE,
    component: MapView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.LEAD_STATUS_TITLE}`,
    },
  },
  {
    path: SCORECARD_ROUTE,
    component: MapView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.LEAD_STATUS_TITLE}`,
    },
  },
  {
    path: MAP_ROUTE_BASE,
    component: MapView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.MAP_TITLE}`,
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
    path: ABOUT_ROUTE,
    component: LandingPageView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.ABOUT_TITLE}`,
    },
  },
];

/** Defines all routes for the app **/
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export {
  router,
  HOME_ROUTE,
  SCORECARD_BASE,
  SCORECARD_ROUTE,
  MAP_ROUTE_BASE,
  MAP_ROUTE,
  ABOUT_ROUTE,
};
