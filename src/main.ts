import "reflect-metadata";

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import { InitializeAuthComponent } from "@/helpers/auth";
import "./registerServiceWorker";

// import _ from "lodash";
// Object.defineProperty(Vue.prototype, "$_", { value: _ });

store.commit("retrieveLocalData");

Vue.use(InitializeAuthComponent);

Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.config.performance = process.env.NODE_ENV !== "production";

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
