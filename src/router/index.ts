import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import store from "@/store/index";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "home",
    component: () => import(/* webpackChunkName: "home" */ "@/views/Home.vue")
  },
  {
    path: "/token/:token",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "login" */ "@/views/Login.vue"),
    beforeEnter(_to, _from, next) {
      !store.state.token ? next() : next({ name: "home" });
    }
  },
  {
    path: "/audio",
    name: "audio-test",
    component: () =>
      import(/* webpackChunkName: "audio" */ "@/views/Audio.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "*",
    name: "404-error",
    component: () =>
      import(/* webpackChunkName: "404" */ "@/views/PageNotFound.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  routes
});

router.beforeEach((to, _from, next) => {
  if (to.matched.some(route => route.meta.requiresAuth) && !store.state.token) {
    next({ name: "login" });
  } else next();
});
export default router;
