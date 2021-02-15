<template>
  <transition name="fade" appear>
    <v-container
      fill-height
      fluid
      style="position: absolute; top:0; left:0"
      class="overflow-hidden"
    >
      <v-main>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <div
              v-on="on"
              id="speaker"
              :style="
                `top: calc(50% - ${pos.z * 5}px);
            left: calc(50% + ${pos.x * 5}px);`
              "
            />
          </template>

          <span>{{ player.data.username }}</span>
        </v-tooltip>
      </v-main>
      <!--    </v-fade-transition>-->
      <v-progress-linear
        :active="loading"
        top
        indeterminate
        fixed
        height="8px"
      />
    </v-container>
  </transition>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
// import { cartesianToPolar } from "@/helpers/vectors";
import { Player, PlayerPosition } from "@/helpers/interfaces";
import { AudioContext, PannerNode } from "standardized-audio-context";

// const AudioContext = window.AudioContext || window.webkitAudioContext;

export default Vue.extend({
  name: "AudioHandler",
  props: {
    stream: {
      type: MediaStream,
      required: false
    },
    pos: {
      type: PlayerPosition,
      required: true
    },
    player: {
      type: Object as PropType<Player>,
      required: true,
      validator: function(obj: never) {
        return "data" in obj;
      }
    },
    audioCtx: {
      type: AudioContext,
      required: true
    }
  },
  data: () => {
    return {
      // mediaStream: null as MediaStream | null,
      // audioCtx: null as AudioContext | null,
      panner: null as PannerNode<AudioContext> | null,
      // posX: 0,
      // posZ: 0,
      loading: true
    };
  },
  watch: {
    stream(val) {
      if (!(val instanceof MediaStream)) return;
      this.init();
    },
    pos({ x, y, z }: PlayerPosition) {
      if (this.panner) {
        this.positionPanner(this.panner, x, y, z);
      }
    }
  },
  methods: {
    positionPanner(
      panner: PannerNode<AudioContext>,
      x: number,
      y: number,
      z: number
    ) {
      try {
        panner.positionX.setValueAtTime(x, panner.context.currentTime);
        panner.positionY.setValueAtTime(y, panner.context.currentTime);
        panner.positionZ.setValueAtTime(-z, panner.context.currentTime);
      } catch {
        // panner.setPosition(x, y, z);
      }
    },
    init() {
      const audioCtx: AudioContext = this.audioCtx;

      audioCtx.resume();

      // const source = audioCtx.createMediaElementSource(audioNode);

      if (!this.stream) {
        throw Error("Media stream has not been instantiated yet!");
      }
      const source = audioCtx.createMediaStreamSource(this.stream);

      this.loading = false;

      const panner: PannerNode<AudioContext> = (this.panner = audioCtx.createPanner());

      panner.panningModel = "HRTF";
      panner.distanceModel = "linear";
      panner.refDistance = 20;
      panner.maxDistance = 130;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 0;
      panner.coneOuterGain = 0;
      this.positionPanner(panner, this.pos.x, this.pos.y, this.pos.z);

      // audioCtx.listener.positionZ.value = 100;
      // audioCtx.listener.forwardZ.value = 1;

      source.connect(panner);
      panner.connect(audioCtx.destination);

      this.test();
    },
    test() {
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

        this.pos.x += pos.x;
        this.pos.z += pos.z;
        if (!this.panner) return;
        this.positionPanner(this.panner, this.pos.x, this.pos.y, this.pos.z);

        window.requestAnimationFrame(tick);
      };

      const speakerEl = document.querySelector("#speaker");

      if (speakerEl != null)
        speakerEl.addEventListener("touchmove", (_event: Event) => {
          const event = _event as TouchEvent;
          const x = event.touches[0].clientX;
          const y = event.touches[0].clientY - 40;

          const bounds = document.body.getBoundingClientRect();
          const center = [bounds.width / 2, bounds.height / 2];

          const relativePos = [(x - center[0]) / 5, -(y - center[1]) / 5];

          this.pos.x = relativePos[0];
          this.pos.z = relativePos[1];

          if (!this.panner) return;
          this.positionPanner(
            this.panner,
            Math.round(relativePos[0]),
            this.pos.y,
            Math.round(relativePos[1])
          );
        });
      window.requestAnimationFrame(tick);
    }
  },
  mounted() {
    if (this.stream) this.init();
  },
  destroyed() {
    // this.audioCtx?.close();
    this.panner?.disconnect();
    console.log("Closed audio.");
  }
});
</script>

<style scoped lang="scss">
#speaker {
  width: 50px;
  height: 50px;
  background-color: #2c3e50;
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 5;
}
</style>
