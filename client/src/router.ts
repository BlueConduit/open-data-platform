import { createRouter, createWebHistory } from 'vue-router';
import LandingPageView from './views/LandingPageView.vue';
import MapView from './views/MapView.vue';
import { APP_TITLE, HOME_TITLE, MAP_TITLE, ABOUT_TITLE } from './assets/messages/common';

const HOME_ROUTE = '/';
const MAP_ROUTE = '/map';
const ABOUT_ROUTE = '/about';

const routes = [
  {
    path: HOME_ROUTE,
    component: LandingPageView,
    meta: {
      title: `${APP_TITLE} - ${HOME_TITLE}`,
    },
  },
  {
    path: MAP_ROUTE,
    component: MapView,
    meta: {
      title: `${APP_TITLE} - ${MAP_TITLE}`,
    },
  },
  {
    path: ABOUT_ROUTE,
    component: LandingPageView,
    meta: {
      title: `${APP_TITLE} - ${ABOUT_TITLE}`,
    },
  },
];

/** Defines all routes for the app **/
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export { router, HOME_ROUTE, MAP_ROUTE, ABOUT_ROUTE };
