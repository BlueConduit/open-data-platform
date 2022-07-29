import { createRouter, createWebHistory } from 'vue-router';
import { APP_TITLE, HOME_TITLE, MAP_TITLE, CONTACT_TITLE } from './assets/messages/common';
import MapContentContainer from './components/MapContentContainer.vue';

const HOME_ROUTE = '/';
const MAP_ROUTE = '/map';
const CONTACT_ROUTE = '/contact';

const routes = [
  {
    path: HOME_ROUTE,
    component: MapContentContainer,
    meta: {
      title: `${APP_TITLE} - ${HOME_TITLE}`,
    },
  },
  {
    path: MAP_ROUTE,
    component: MapContentContainer,
    meta: {
      title: `${APP_TITLE} - ${MAP_TITLE}`,
    },
  },
  {
    path: CONTACT_ROUTE,
    component: MapContentContainer,
    meta: {
      title: `${APP_TITLE} - ${CONTACT_TITLE}`,
    },
  },
];

/** Defines all routes for the app **/
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export { router, HOME_ROUTE, MAP_ROUTE, CONTACT_ROUTE };
