<template>
  <!--  <v-fade-transition hide-on-leave>-->
  <v-container class="overflow-hidden" fill-height fluid>
    <v-btn
      v-if="manualAudio"
      @click="manualPlay"
      class="centerBtn"
      depressed
      block
      height="100%"
      >Play Audio</v-btn
    >
    <div id="player" />
    <AudioHandler
      v-for="player in audioPlayers"
      :key="player.data.uuid"
      :pos="player.pos"
      :stream="player.stream"
      :player="player"
      :audioCtx="audioCtx"
    />

    <audio
      id="music"
      src="@/assets/The Musical Guy - Other Guy.mp3"
      preload="auto"
      loop
    />
  </v-container>
  <!--  </v-fade-transition>-->
</template>

<script lang="ts">
import Vue from "vue";
import AudioHandler from "@/components/AudioHandler.vue";
import { AudioContext } from "standardized-audio-context";
import { Player } from "@/helpers/interfaces";

// const AudioContext = window.AudioContext || window.webkitAudioContext;

const audioCtx = new AudioContext();

export default Vue.extend({
  name: "Audio",
  data() {
    return {
      manualAudio: false,
      audioCtx: new AudioContext(),
      players: this.$store.state.peers
    };
  },
  computed: {
    audioPlayers(): Player[] {
      return this.players.filter(
        (p: Player) => p.online && p.dimension == this.$auth.user.dimension
      );
    }
  },
  components: { AudioHandler },
  methods: {
    manualPlay() {
      const audioNode = document.querySelector("#music") as HTMLMediaElement;
      audioNode.play();
      this.manualAudio = false;
      // this.audioCtx.resume();
      // audioCtx.resume();
      this.testMediaStream();
    },
    testMediaStream() {
      const audioNode = document.querySelector("#music") as HTMLMediaElement;
      // const audioCtx = new AudioContext();
      audioCtx.resume();

      const source = audioCtx.createMediaElementSource(audioNode);

      const audioDestinationNode = audioCtx.createMediaStreamDestination();
      const audioDestinationNode2 = audioCtx.createMediaStreamDestination();

      source.connect(audioDestinationNode);
      source.connect(audioDestinationNode2);

      // audioNode.addEventListener("play", () => {
      this.$set(this.players[0], "stream", audioDestinationNode.stream);
      // this.$set(this.players[1], "stream", audioDestinationNode2.stream);
      // });

      /* setInterval(async () => {
        const { body } = await this.$auth.sendWS(
          {
            action: "user_info"
          },
          true
        );

        let pos = body?.user?.pos;

        if (pos) {
          pos = { x: 0, y: 0, z: 0, ...pos };

          this.$auth.user.pos.registerPosition(
            pos.x,
            pos.y,
            pos.z,
            pos.rotation
          );
        }
      }, 1000 / 20); */
    },

    async initiateUserMedia(): Promise<void> {
      try {
        if (!this.$store.state.clientStream) {
          const stream: MediaStream = await navigator.mediaDevices.getUserMedia(
            { audio: true }
          );
          this.$store.commit("setStream", stream);
        }
      } catch (e) {
        console.error("User declined request for microphone access!");
      }
    },
    stopUserMedia(): void {
      if (this.clientStream) {
        this.$store.state.clientStream
          .getTracks()
          .forEach(function(track: MediaStreamTrack) {
            track.stop();
          });
        this.$store.commit("setStream", undefined);
      }
    }
  },
  mounted() {
    // if (!navigator.mediaDevices)
    //   throw new Error("On unsecure connection, cannot establish microphone.");

    const audioNode = document.querySelector("#music") as HTMLMediaElement;
    setTimeout(() => {
      audioNode.play().then(
        () => {
          this.testMediaStream();
        },
        () => {
          this.manualAudio = true;
        }
      );
    }, 500);

    /* eslint-disable-next-line */
    (window as any).audioView = this;

    // const mediaStream: MediaStream = (this.mediaStream = await navigator.mediaDevices.getUserMedia(
    //   {
    //     video: false,
    //     audio: true
    //   }
    // ));
  },
  async created() {
    await this.$auth.waitLoad();
    await this.$auth.sendWS({ action: "peer_info" }, true, false);
    await this.$auth.sendWS({ action: "user_connect" }, true, false);
    // await this.initiateUserMedia();
  },

  async destroyed() {
    await this.$auth.waitLoad();
    await this.$auth.sendWS({ action: "user_disconnect" }, true, false);
    await this.stopUserMedia();
  }
});
</script>

<style scoped>
.centerBtn {
  position: absolute;
  transform: translate(-50%, -50%);
  top: calc(50%);
  left: 50%;
  z-index: 10;
  font-size: 30px !important;
  font-weight: bold !important;
}

#player {
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  background-color: lightcoral;
}
</style>
