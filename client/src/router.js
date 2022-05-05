import { createRouter, createWebHistory } from 'vue-router'
import MapContainer from './components/MapContainer.vue'

/** Defines all routes for the app **/
export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MapContainer,
    },
    {
      path: '/learn-more',
      component: MapContainer,
    },
    {
      path: '/contact',
      component: MapContainer,
    }
  ]
})
