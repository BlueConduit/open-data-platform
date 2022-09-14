import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { createRedux } from '@/model/store_plugin';
import { store } from '@/model/store';
import { logBuildInfo } from './util/build_id';

/**
 * Starts up the application.
 */
createApp(App).use(router).use(createRedux(store)).mount('#app');
logBuildInfo();
