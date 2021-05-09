import Vue from 'vue'
import App from './App.vue'
import Router from 'vue-router'
import router from './router/router'
import { store } from './vuex/store';
import { initTheme } from "./theme/initTheme";

Vue.config.productionTip = false

Vue.use(Router)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
initTheme();
