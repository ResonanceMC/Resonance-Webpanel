const PORT = "";
const HOST = "thiccaxe.net/ws";

import _Vue from "vue";
import store from "@/store/index";
import { WSMessage } from "@/helpers/interfaces";

let authInfo: _Vue;

let socketQueueId = 0;
const socketQueue: {
  [key in string]: (
    value?: WSMessage | PromiseLike<WSMessage> | undefined
  ) => void;
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
        get(): string | undefined {
          return store.state.token;
        },
        set(val: string | undefined): void {
          store.commit("setToken", val);
        }
      }
    },
    methods: {
      // eslint-disable-next-line
      sendWS(data: Record<string, any>): Promise<WSMessage> {
        return new Promise<WSMessage>((resolve, reject) => {
          if (!this.socket) throw Error("Socket is not defined yet.");
          if (this.socket.readyState != this.socket.OPEN) {
            console.error("Socket is in a closing/non-open state.");
            reject();
          }

          socketQueue["i_" + socketQueueId] = resolve;
          this.socket.send(JSON.stringify({ id: socketQueueId, ...data }));

          socketQueueId++;
        });
      },
      async authToken(token: string): Promise<boolean> {
        const sendData = {
          action: "authenticate",
          body: { token }
        };

        try {
          const data = await this.sendWS(sendData);
          return data.action == "authenticated";
        } catch {
          this.error =
            "WebSocket connection is closed!\nPlease try again later.";
          return false;
        }
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
          if (data.action == "authenticated") {
            this.token = data.body.token;
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

          console.log(data.id, socketQueue["i_" + data.id]);
          if (data.id != undefined && socketQueue["i_" + data.id]) {
            socketQueue["i_" + data.id](data);
            delete socketQueue["i_" + data.id];
          }
        } catch (e) {
          console.log(e);
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
