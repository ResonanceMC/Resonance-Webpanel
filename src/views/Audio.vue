<template>
  <!--  <v-fade-transition hide-on-leave>-->
  <v-container class="overflow-hidden" fill-height fluid>
    <v-btn
      v-if="manualAudio"
      @click="onInteraction"
      class="centerBtn"
      depressed
      block
      height="100%"
      color="yellow darken-2"
      >Start Audio
    </v-btn>
    <div class="d-inline-flex justify-center control-buttons">
      <v-btn
        class="ma-4 rounded-circle"
        :class="{ speaking: speaking }"
        id="mute-button"
        large
        elevation="4"
        dark
        :color="(muteState ? 'red' : 'blue-grey') + ' darken-4'"
        height="70px"
        width="70px"
        min-width="0"
        @click="toggleMute()"
      >
        <v-icon large>{{
          muteState ? "mdi-microphone-off" : "mdi-microphone"
        }}</v-icon>
      </v-btn>
    </div>
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
import { AudioContext, AudioWorkletNode } from "standardized-audio-context";
import { Player } from "@/helpers/interfaces";

// const AudioContext = window.AudioContext || window.webkitAudioContext;

// const audioCtx = new AudioContext();

export default Vue.extend({
  name: "Audio",
  data() {
    return {
      manualAudio: false,
      audioCtx: new AudioContext(),
      players: this.$store.state.peers,
      muteState: this.$store.state.muted,
      speaking: false
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
            {
              audio: {
                autoGainControl: true,
                echoCancellation: true,
                noiseSuppression: true
              }
            }
          );
          this.$store.commit("setStream", stream);
        }
      } catch (e) {
        console.error("User declined request for microphone access!");
        this.muteState = true;
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
    },
    updateMuteState(
      state: boolean = this.$store.state.muted ?? this.muteState
    ) {
      this.$store.commit("setMuteState", state);
      this.$store.state.clientStream
        ?.getAudioTracks()
        ?.forEach((track: MediaStreamTrack) => (track.enabled = !state));

      this.players.forEach((player: Player) => player.muteClientStream(state));
    },
    toggleMute() {
      if (!this.$store.state.clientStream) return;
      this.muteState = !this.muteState;
      this.updateMuteState(this.muteState);
    },
    onInteraction() {
      this.audioCtx.resume();
      this.manualAudio = false;
    }
  },
  mounted() {
    if (this.$auth.debug) window.audioView = this;
  },
  async created() {
    await this.$auth.waitLoad();
    await this.$auth.sendWS({ action: "peer_info" }, true, false);
    await this.$auth.sendWS({ action: "user_connect" }, true, false);
    await this.initiateUserMedia();
    this.updateMuteState();
    if (this.$store.state.clientStream) {
      const source = this.audioCtx.createMediaStreamSource(
        this.$store.state.clientStream
      );
      await this.audioCtx.audioWorklet.addModule(
        "/processors/sound-meter-processor.js"
      );
      if (AudioWorkletNode) {
        const soundMeterNode = new AudioWorkletNode(
          this.audioCtx,
          "sound-meter-processor"
        );
        soundMeterNode.port.onmessage = e => {
          this.speaking = e.data > 0.03 && !this.muteState;
        };
        source.connect(soundMeterNode);
      }
    }

    if (this.audioCtx.state == "suspended") {
      this.manualAudio = true;
    }
  },

  async beforeDestroy() {
    await this.audioCtx.close();
    this.audioCtx = null;
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

.control-buttons {
  bottom: 30px;
  left: 0;
  width: 100%;
  position: fixed;
  z-index: 10;
}

#mute-button.speaking {
  border: #3ac184 5px solid !important;
}
</style>
