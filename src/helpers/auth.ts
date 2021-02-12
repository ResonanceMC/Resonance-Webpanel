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
    computed: {
      token: {
        get(): string {
          return this.$store.state.token.value;
        },
        set(val: string | undefined): void {
          this.$store.commit("setToken", val);
        }
      }
    },
    methods: {
      sendWS: function(data: string): void {
        if (!this.socket) throw Error("Socket is not defined yet.");
        if (this.socket.readyState != this.socket.OPEN)
          return console.error("Socket is in a closing/non-open state.");

        this.socket.send(data);
      }
    },
    created() {
      const socket = (this.socket = new WebSocket(
        `wss://${HOST}${PORT ? ":" + PORT : ""}`
      ));

      socket.onerror = () => {
        this.loaded = true;
        this.error =
          "WebSocket connection has errored!\nPlease try again later.";
      };

      socket.onopen = () => {
        this.loaded = true;
      };

      socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log(data);
          console.log(data.action);
          console.log(data.body.token);
          if (data.action == "authenticated") {
            this.token = data.token;
          } else if (data.action == "authentication_failed") {
            this.token = undefined;
          } else if (data.action == "keep_alive") {
            socket.send(
              JSON.stringify({
                action: "keep_alive",
                body: { token: this.token }
              })
            );
          }
        } catch {
          console.log(event.data);
        }
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
