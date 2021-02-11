import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

interface AuthStore {
  token?: string;
}

export default new Vuex.Store({
  state: {} as AuthStore,
  mutations: {
    setToken(state, token: string) {
      state.token = token;
    }
  },
  actions: {},
  modules: {}
});
