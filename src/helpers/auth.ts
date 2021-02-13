const PORT = "";
const HOST = "thiccaxe.net/ws";

import _Vue from "vue";

let authInfo: _Vue;

let socketQueueId = 0;
const socketQueue: {
  [key in string]: (value?: string | PromiseLike<string> | undefined) => void;
} = {};

export function InitializeAuthComponent(
  Vue: typeof _Vue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: never
): void {
  authInfo = new _Vue({
    data() {
      return {
        loaded: false
      } as InnerAuthInterface;
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
      // eslint-disable-next-line
      sendWS(data: Record<string, any>): Promise<string> {
        return new Promise<string>((resolve, reject) => {
          if (!this.socket) throw Error("Socket is not defined yet.");
          if (this.socket.readyState != this.socket.OPEN) {
            console.error("Socket is in a closing/non-open state.");
            reject();
          }

          socketQueue["i_" + socketQueueId] = resolve;
          socketQueueId++;

          this.socket.send(JSON.stringify({ id: socketQueueId, ...data }));
        });
      },
      async authToken(token: string): Promise<boolean> {
        const sendData = {
          action: "authenticate",
          body: { token }
        };

        const returnedData = JSON.parse(await this.sendWS(sendData));
        return returnedData.action == "authenticated";
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

          if (
            typeof data["id"] != "undefined" &&
            typeof socketQueue["i_" + data["id"]] == "function"
          ) {
            const execFunc = socketQueue["i_" + data["id"]];
            execFunc(data);
            delete socketQueue["i_" + data["cmd_id"]];
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

interface InnerAuthInterface {
  token?: string;
  user?: { username: string; uuid: string };
  loaded: boolean;
  socket?: WebSocket;
  error?: string;
}

export interface AuthInterface extends InnerAuthInterface {
  sendWS(token: string): Promise<string>;
  authToken(data: string): Promise<boolean>;
}
