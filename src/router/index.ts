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
    path: "/token/:token?",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "login" */ "@/views/Login.vue"),
    beforeEnter(_to, _from, next) {
      !store.state.token ? next() : next({ name: "audio-chat" });
    },
    props: true
  },
  {
    path: "/audio",
    name: "audio-chat",
    component: () =>
      import(/* webpackChunkName: "audio" */ "@/views/Audio.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/test",
    name: "audio-test",
    component: () =>
      import(/* webpackChunkName: "audio" */ "@/views/AudioTest.vue"),
    meta: { requiresAuth: false }
  },
  {
    path: "*",
    name: "404-error",
    component: () =>
      import(/* webpackChunkName: "404" */ "@/views/PageNotFound.vue")
  },
  {
    path: "/offline",
    name: "offline",
    component: () =>
      import(/* webpackChunkName: "offline" */ "@/views/Offline.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  routes
});

router.beforeEach((to, _from, next) => {
  if (to.matched.some(route => route.meta.requiresAuth) && !store.state.token) {
    next({ name: "login" });
  } else if (
    to.matched.some(route => route.name == "offline") &&
    navigator.onLine
  ) {
    next({ name: "home" });
  } else if (
    !to.matched.some(route => route.name == "offline") &&
    !navigator.onLine
  ) {
    next({ name: "offline" });
  } else next();
});
export default router;
