<template>
  <div>
    <div id="player"></div>
    <audio
      id="music"
      src="@/assets/The Musical Guy - Other Guy.mp3"
      preload="auto"
      loop
    ></audio>
    <div
      id="speaker"
      :style="
        `top: calc(50% - ${posZ * 5}px); left: calc(50% + ${posX * 5}px);`
      "
    ></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "AudioHandler",
  data: () => {
    return {
      mediaStream: null as MediaStream | null,
      audioCtx: null as AudioContext | null,
      panner: null as PannerNode | null,
      posX: 0,
      posZ: 0
    };
  },
  async mounted() {
    if (!navigator.mediaDevices)
      throw new Error("On unsecure connection, cannot establish microphone.");
    console.log("Instantiating Media Stream...");

    // const mediaStream: MediaStream = (this.mediaStream = await navigator.mediaDevices.getUserMedia(
    //   {
    //     video: false,
    //     audio: true
    //   }
    // ));

    function positionPanner(
      panner: PannerNode,
      x: number,
      y: number,
      z: number
    ) {
      panner.positionX.setValueAtTime(x, panner.context.currentTime);
      panner.positionY.setValueAtTime(y, panner.context.currentTime);
      panner.positionZ.setValueAtTime(z, panner.context.currentTime);
    }

    const audioCtx: AudioContext = (this.audioCtx = new AudioContext());

    const audioNode = document.querySelector("#music") as HTMLMediaElement;

    audioNode.play().then();

    const source = audioCtx.createMediaElementSource(audioNode);
    const panner: PannerNode = (this.panner = audioCtx.createPanner());

    panner.panningModel = "HRTF";
    panner.distanceModel = "inverse";
    panner.refDistance = 20;
    panner.maxDistance = 130;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;

    source.connect(panner);
    panner.connect(audioCtx.destination);
    positionPanner(panner, 0, 0, 0);

    const keys: { [key in string]?: boolean } = {
      w: false,
      a: false,
      s: false,
      d: false
    };

    document.addEventListener("keydown", e => {
      if (e.key in keys) keys[e.key] = true;
    });

    document.addEventListener("keyup", e => {
      if (e.key in keys) keys[e.key] = false;
    });

    const tick = () => {
      const pos = { x: 0, z: 0 };
      if (keys.w) pos.z++;
      if (keys.s) pos.z--;
      if (keys.d) pos.x++;
      if (keys.a) pos.x--;

      this.posX += pos.x;
      this.posZ += pos.z;
      panner.positionX.value += pos.x;
      panner.positionZ.value += pos.z;
      // console.log(pos, this.posX);

      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  },
  destroyed() {
    this.audioCtx?.close();
    this.panner?.disconnect();
    console.log("Closed audio.");
  }
});
</script>

<style scoped>
#speaker {
  width: 50px;
  height: 50px;
  background-color: #2c3e50;
  position: absolute;
  transform: translate(-50%, -50%);
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
