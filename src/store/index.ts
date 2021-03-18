import Vue from "vue";
import Vuex from "vuex";
import { Player, PlayerPosition } from "@/helpers/interfaces";
import { plainToClass } from "class-transformer";

Vue.use(Vuex);

interface AuthStore {
  token?: string;
  peers: Player[];
}

export default new Vuex.Store({
  state: {
    token: undefined,
    peers: [
      plainToClass(Player, {
        data: {
          username: "TestPlayer",
          uuid: "3234-lkj3-dfsdlkj43"
        },
        pos: new PlayerPosition({ x: -49, y: 80, z: 110 })
      })
    ] as Player[]
  } as AuthStore,
  mutations: {
    retrieveLocalData(state) {
      const token = localStorage.getItem("token");
      if (token) {
        state.token = token;
      }
    },
    setToken(state, token?: string) {
      token
        ? localStorage.setItem("token", token)
        : localStorage.removeItem("token");
      state.token = token;
    },
    addPeer(state, peer: Player) {
      // check if peer already exists within state
      if (state.peers.find(p => p.data?.uuid == peer.data?.uuid)) return;
      state.peers.push(peer);
    },
    removePeer(state, peer: Player) {
      // filter peer from peer list
      const index = state.peers.findIndex(p => p.data?.uuid == peer.data?.uuid);

      if (index != -1) state.peers.splice(index, 1);
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
