<template>
  <!--  <v-fade-transition hide-on-leave>-->
  <v-container class="overflow-hidden" fill-height fluid>
    <div id="player" />
    <AudioHandler
      v-for="player in players"
      :key="player.data.uuid"
      :pos="player.pos"
      :stream="player.stream"
      :player="player"
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

export default Vue.extend({
  name: "Audio",
  data() {
    return {
      players: [
        {
          data: {
            username: "TestPlayer",
            uuid: "3234-lkj3-dfsdlkj43"
          },
          pos: new PlayerPosition()
        }
      ] as Player[]
    };
  },
  components: { AudioHandler },
  methods: {
    testMediaStream() {
      // interface MediaElement extends HTMLMediaElement {
      //   captureStream(frameRate?: number): MediaStream;
      // }

      const audioNode = document.querySelector("#music") as HTMLMediaElement;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(audioNode);
      // source.connect(audioCtx.destination);

      const audioDestinationNode = audioCtx.createMediaStreamDestination();

      source.connect(audioDestinationNode);

      audioNode.addEventListener("play", () => {
        this.$set(this.players[0], "stream", audioDestinationNode.stream);
      });

      setTimeout(() => {
        audioNode.play();
      }, 500);
    }
  },
  mounted() {
    if (!navigator.mediaDevices)
      throw new Error("On unsecure connection, cannot establish microphone.");

    this.testMediaStream();

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
