import { createRouter, createWebHistory } from 'vue-router'
import MapContainer from './components/MapContainer.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MapContainer,
    },
    {
      path: '/about',
      component: MapContainer,
    }
  ]
})
