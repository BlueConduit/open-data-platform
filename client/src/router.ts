import { createRouter, createWebHistory, RouteLocationNormalized } from 'vue-router';
import LandingPageView from './views/LandingPageView.vue';
import ScorecardView from './views/ScorecardView.vue';
import { Titles } from './assets/messages/common';
import ResourceView from '@/views/ResourceView.vue';
import NationwideMapView from '@/views/NationwideMapView.vue';
import AboutUsView from '@/views/AboutUsView.vue';
import ThankYouView from '@/views/ThankYouView.vue';
import BlogView from '@/views/BlogView.vue';
import { nextSteps } from '@/assets/blog/next_steps';
import { historyOfLead } from '@/assets/blog/history_of_lead';
import { understandLead } from '@/assets/blog/understand_lead_status';
import BlogHomePageView from '@/views/BlogHomePageView.vue';
import { leadHealthEffects } from '@/assets/blog/lead_health_effects';
import { aboutUsContent } from '@/assets/messages/about_us_messages';

export const LAT_LONG_PARAM = 'latlong';
export const LAYER_PARAM = 'layer';
export const GEOTYPE_PARAM = 'geotype';

const HOME_ROUTE = '/';
const SCORECARD_BASE = `/scorecard`;
const SCORECARD_ROUTE = `${SCORECARD_BASE}/:${GEOTYPE_PARAM}/:${LAT_LONG_PARAM}`;
const MAP_ROUTE_BASE = `/map`;
const MAP_ROUTE = `${MAP_ROUTE_BASE}/:${GEOTYPE_PARAM}/:${LAT_LONG_PARAM}?`;
const RESOURCES_ROUTE = '/resources';
const SUBSCRIBED_ROUTE = '/subscribed';
const BLOG_ROUTE = '/blog';

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
    path: aboutUsContent.route,
    component: AboutUsView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.ABOUT_TITLE}`,
    },
  },
  {
    path: BLOG_ROUTE,
    component: BlogHomePageView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.BLOG}`,
    },
  },
  {
    path: nextSteps.route,
    component: BlogView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.BLOG}`,
    },
    props: {
      title: nextSteps.title,
      content: nextSteps.content,
      image: nextSteps.image,
    },
  },
  {
    path: historyOfLead.route,
    component: BlogView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.BLOG}`,
    },
    props: {
      title: historyOfLead.title,
      content: historyOfLead.content,
      image: historyOfLead.image,
    },
  },
  {
    path: understandLead.route,
    component: BlogView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.BLOG}`,
    },
    props: {
      title: understandLead.title,
      content: understandLead.content,
      image: understandLead.image,
    },
  },
  {
    path: leadHealthEffects.route,
    component: BlogView,
    meta: {
      title: `${Titles.APP_TITLE} - ${Titles.BLOG}`,
    },
    props: {
      title: leadHealthEffects.title,
      content: leadHealthEffects.content,
      image: leadHealthEffects.image,
    },
  },
  {
    path: SUBSCRIBED_ROUTE,
    component: ThankYouView,
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

/// Remove layer query from scorecard page.
router.beforeEach((to: RouteLocationNormalized, _) => {
  if (to.path.startsWith(SCORECARD_BASE) && to.query.layer != null) {
    router.push({ path: to.path, query: {} });
  }
});

export {
  router,
  HOME_ROUTE,
  BLOG_ROUTE,
  SCORECARD_BASE,
  SCORECARD_ROUTE,
  MAP_ROUTE_BASE,
  MAP_ROUTE,
  RESOURCES_ROUTE,
};
