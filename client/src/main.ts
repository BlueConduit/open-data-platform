import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { createRedux } from '@/model/store_plugin';
import { store } from '@/model/store';
import { logBuildInfo } from './util/build_id';
import FloatingVue from 'floating-vue';
import { VTooltip, Tooltip } from 'floating-vue';

/**
 * Starts up the application.
 */
const app = createApp(App);
app.use(router).use(createRedux(store)).use(FloatingVue).mount('#app');
app.directive('tooltip', VTooltip);
app.component('VTooltip', Tooltip);
logBuildInfo();
