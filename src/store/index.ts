import Vue from "vue";
import Vuex from "vuex";
import { LogType, Player } from "@/helpers/interfaces";

Vue.use(Vuex);

interface AuthStore {
  token?: string;
  peers: Player[];
  clientStream?: MediaStream;
  logType: LogType;
  muted: boolean;
}

export default new Vuex.Store({
  state: {
    token: undefined,
    clientStream: undefined,
    muted: true,
    logType:
      process.env.NODE_ENV === "development" ? LogType.DEBUG : LogType.ERROR,
    peers: [] as Player[]
  } as AuthStore,
  mutations: {
    retrieveLocalData(state) {
      const token = localStorage.getItem("token");
      const logType = localStorage.getItem("logType");
      const muted = localStorage.getItem("muted");
      if (token) state.token = token;
      if (logType) state.logType = logType as LogType;
      if (muted) state.muted = muted == "true";
    },
    setLogType(state, logType: LogType) {
      state.logType = logType;
      localStorage.setItem("logType", logType);
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

      if (index != -1) {
        state.peers[index]?.connection?.close();
        state.peers.splice(index, 1);
      }
    },
    setStream(state, stream?: MediaStream) {
      state.clientStream = stream;

      state.peers.forEach((p: Player) => {
        if (state.clientStream && p.connection) {
          // const clonedStream = state.clientStream.clone();
          // stream?.getTracks().forEach((track: MediaStreamTrack) => {
          //   p?.connection?.addTrack(track, clonedStream);
          // });
          p.setClientStream(state.clientStream);
        }
      });
    },
    setMuteState(state, muted: boolean) {
      state.muted = muted;
      localStorage.setItem("muted", String(muted));
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
