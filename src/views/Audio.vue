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
      v-for="player in players"
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
import { Player, PlayerPosition } from "@/helpers/interfaces";
import { AudioContext } from "standardized-audio-context";

// const AudioContext = window.AudioContext || window.webkitAudioContext;

export default Vue.extend({
  name: "Audio",
  data() {
    return {
      manualAudio: false,
      audioCtx: new AudioContext(),
      players: [
        {
          data: {
            username: "TestPlayer",
            uuid: "3234-lkj3-dfsdlkj43"
          },
          pos: new PlayerPosition()
        },
        {
          data: {
            username: "TestPlayer2",
            uuid: "3234-lkj3-dfsdlkj44"
          },
          pos: new PlayerPosition({ x: 250 })
        }
      ] as Player[]
    };
  },
  components: { AudioHandler },
  methods: {
    manualPlay() {
      const audioNode = document.querySelector("#music") as HTMLMediaElement;
      audioNode.play();
      this.manualAudio = false;
    },
    testMediaStream() {
      // interface MediaElement extends HTMLMediaElement {
      //   captureStream(frameRate?: number): MediaStream;
      // }

      const audioNode = document.querySelector("#music") as HTMLMediaElement;
      const audioCtx = new AudioContext();
      audioCtx.resume();

      const source = audioCtx.createMediaElementSource(audioNode);

      const audioDestinationNode = audioCtx.createMediaStreamDestination();

      source.connect(audioDestinationNode);

      audioNode.addEventListener("play", () => {
        this.$set(this.players[0], "stream", audioDestinationNode.stream);
        this.$set(this.players[1], "stream", audioDestinationNode.stream);
      });

      setTimeout(() => {
        audioNode.play().catch(() => {
          this.manualAudio = true;
        });
      }, 500);
    }
  },
  mounted() {
    // if (!navigator.mediaDevices)
    //   throw new Error("On unsecure connection, cannot establish microphone.");

    this.testMediaStream();

    console.log(this);

    // const mediaStream: MediaStream = (this.mediaStream = await navigator.mediaDevices.getUserMedia(
    //   {
    //     video: false,
    //     audio: true
    //   }
    // ));
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
