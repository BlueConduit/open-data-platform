import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

/**
 * Starts up the application.
 */
createApp(App).use(router).mount('#app')
