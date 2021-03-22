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
    /* eslint-disable-next-line */
    (window as any).audioView = this;
  },
  async created() {
    await this.$auth.waitLoad();
    await this.$auth.sendWS({ action: "peer_info" }, true, false);
    await this.$auth.sendWS({ action: "user_connect" }, true, false);
    await this.initiateUserMedia();
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
