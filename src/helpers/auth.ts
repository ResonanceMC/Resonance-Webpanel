const PORT = "";
const HOST = "thiccaxe.net/ws";

import _Vue from "vue";

let authInfo: _Vue;

export function InitializeAuthComponent(
  Vue: typeof _Vue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: never
): void {
  authInfo = new _Vue({
    data() {
      return {
        loaded: false
      } as AuthInterface;
    },
    methods: {},
    created() {
      const socket = (this.socket = new WebSocket(`wss://${HOST}:${PORT}`));

      socket.onerror = () => {
        this.loaded = true;
        this.error =
          "WebSocket connection has errored!\nPlease try again later.";
      };

      socket.onopen = () => {
        this.loaded = true;
      };

      // setTimeout(() => {
      //   this.loaded = true;
      //   console.log(authInfo);
      // }, 1000);
    }
  });
  Vue.prototype.$auth = authInfo;
}

export interface AuthInterface {
  token?: string;
  user?: { username: string; uuid: string };
  loaded: boolean;
  socket?: WebSocket;
  error?: string;
}
