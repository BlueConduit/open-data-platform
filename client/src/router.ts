import { createRouter, createWebHistory } from 'vue-router';
import LandingPageView from './views/LandingPageView.vue';
import ScorecardView from './views/ScorecardView.vue';
import { Titles } from './assets/messages/common';
import ResourceView from '@/views/ResourceView.vue';
import NationwideMapView from '@/views/NationwideMapView.vue';

export const LAT_LONG_PARAM = 'latlong';

const HOME_ROUTE = '/';
const SCORECARD_BASE = `/scorecard`;
const SCORECARD_ROUTE = `${SCORECARD_BASE}/:${LAT_LONG_PARAM}?`;
const MAP_ROUTE_BASE = `/map`;
const MAP_ROUTE = `${MAP_ROUTE_BASE}/:${LAT_LONG_PARAM}?`;
const ABOUT_ROUTE = '/about';
const RESOURCES_ROUTE = '/resources';

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
    component: ScorecardView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.LEAD_STATUS_TITLE}`,
    },
  },
  {
    path: SCORECARD_ROUTE,
    component: ScorecardView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.LEAD_STATUS_TITLE}`,
    },
  },
  {
    path: MAP_ROUTE_BASE,
    component: NationwideMapView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.MAP_TITLE}`,
    },
  },
  {
    path: MAP_ROUTE,
    component: NationwideMapView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.MAP_TITLE}`,
    },
  },
  {
    path: RESOURCES_ROUTE,
    component: ResourceView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.RESOURCES_TITLE}`,
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
  // Ensures that navigating to different pages takes you to the top of
  // each page, rather than where you were on the previous page.
  scrollBehavior() {
    document?.getElementById('app')?.scrollIntoView({ behavior: 'smooth' });
  },
});

export {
  router,
  HOME_ROUTE,
  RESOURCES_ROUTE,
  SCORECARD_BASE,
  SCORECARD_ROUTE,
  MAP_ROUTE_BASE,
  MAP_ROUTE,
  ABOUT_ROUTE,
  RESOURCES_ROUTE,
};
