import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

interface AuthStore {
  token?: string;
}

export default new Vuex.Store({
  state: { token: undefined } as AuthStore,
  mutations: {
    retrieveLocalData(state) {
      const token = localStorage.getItem("token");
      if (token) {
        state.token = token;
      }
    },
    setToken(state, token: string | undefined) {
      token
        ? localStorage.setItem("token", token)
        : localStorage.removeItem("token");
      state.token = token;
    }
  },
  // getters: {
  //   token: state => {
  //     return state.token;
  //   }
  // },
  actions: {},
  modules: {}
});
