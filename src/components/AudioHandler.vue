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
              class="speaker"
              :class="{ active: speaking }"
              :id="`speaker-${player.data.uuid}`"
              :style="
                `top: calc(50% - ${pos.z * 10}px);
            left: calc(50% + ${pos.x * 10}px);
            background-image: url(https://minotar.net/helm/${
              player.data.uuid
            }/50.png);`
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
const { refDistance, maxDistance } = window.__env.audioSettings;
// import { cartesianToPolar } from "@/helpers/vectors";
import { Player, PlayerPosition } from "@/helpers/interfaces";
import {
  AudioContext,
  PannerNode,
  GainNode,
  AudioWorkletNode
} from "standardized-audio-context";

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
      gainNode: null as GainNode<AudioContext> | null,
      loading: true,
      speaking: false
      // stream: undefined
      // posX: 0,
      // posZ: 0,
    };
  },
  watch: {
    stream(val) {
      if (!(val instanceof MediaStream)) return;
      new Audio().srcObject = val;
      this.init();
    },
    pos(val: PlayerPosition) {
      if (!this.stream) return;
      if (val.distance > this.panner.maxDistance + 10) {
        this.player.muteClientStream(true);
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      } else if (this.panner) {
        this.player.muteClientStream(false);
        this.positionPanner(this.panner, val.x, val.y, val.z);
      }
    },
    player(val: Player) {
      if (val.connection?.connectionState == "connected" && this.loading)
        this.init();
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

      // compute distance squared for gain falloff
      const distance = x ** 2 + y ** 2 + z ** 2;

      const falloffGain =
        ((panner.maxDistance / 2) ** 2 - distance) / panner.maxDistance ** 2 +
        1;

      if (distance >= (panner.maxDistance / 2) ** 2 && falloffGain >= 0) {
        this.gainNode.gain.setValueAtTime(
          falloffGain,
          this.audioCtx.currentTime
        );
      } else if (distance < (panner.maxDistance / 2) ** 2) {
        this.gainNode.gain.setValueAtTime(1, this.audioCtx.currentTime);
      } else {
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      }

      // console.log(
      //   Math.sqrt(distance),
      //   this.panner.maxDistance,
      //   this.gainNode.gain.value
      // );
    },
    init() {
      this.$auth.waitLoad().then(() => {
        this.pos.setParent(this.$auth.user.pos);
      });

      const audioCtx: AudioContext = this.audioCtx;

      // const source = audioCtx.createMediaElementSource(audioNode);
      this.loading =
        this.player.connection?.connectionState != "connected" && !this.stream;

      if (this.stream) {
        audioCtx.resume();
        const source = audioCtx.createMediaStreamSource(this.stream);

        const panner: PannerNode<AudioContext> = (this.panner = audioCtx.createPanner());
        const gainNode: GainNode<AudioContext> = (this.gainNode = audioCtx.createGain());

        panner.panningModel = "HRTF";
        panner.distanceModel = "inverse";
        panner.refDistance = refDistance ?? 3;
        panner.maxDistance = maxDistance ?? 20;
        panner.rolloffFactor = 1;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;
        this.positionPanner(panner, this.pos.x, this.pos.y, this.pos.z);

        // audioCtx.listener.positionZ.value = 100;
        // audioCtx.listener.forwardZ.value = 1;

        if (AudioWorkletNode) {
          try {
            const soundMeterNode = new AudioWorkletNode(
              audioCtx,
              "sound-meter-processor"
            );
            soundMeterNode.port.onmessage = e => {
              this.speaking = e.data > 0.01 && !this.muteState;
            };

            gainNode.connect(soundMeterNode);
          } catch (e) {
            console.error("Failed to initialize sound meter: ", e);
          }
        }

        source.connect(panner);
        panner.connect(gainNode);
        gainNode.connect(audioCtx.destination);
      }

      // this.test();
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

        if (pos.x != 0) this.pos.vector.x += pos.x;
        if (pos.z != 0) this.pos.vector.z += pos.z;
        if (!this.panner) return;
        this.positionPanner(this.panner, this.pos.x, this.pos.y, this.pos.z);

        window.requestAnimationFrame(tick);
      };

      const speakerEl = document.querySelector(
        `#speaker-${this.player.data.uuid}`
      );

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
  async mounted() {
    await this.audioCtx.audioWorklet.addModule(
      "/processors/sound-meter-processor.js"
    );
    if (this.stream) this.init();
  },
  destroyed() {
    // this.audioCtx?.close();
    this.panner?.disconnect();
    this.pos.unMount();

    delete this.pos;
    delete this.audioCtx;
    delete this.panner;
    console.log("Closed audio.");
  }
});
</script>

<style scoped lang="scss">
@mixin alpha-color($desired_colour, $desired_alpha, $background_colour) {
  $r3: red($desired_colour);
  $g3: green($desired_colour);
  $b3: blue($desired_colour);
  $r2: red($background_colour);
  $g2: green($background_colour);
  $b2: blue($background_colour);
  // r1 = (r3 - r2 + r2 * a1) / a1
  $r1: ($r3 - $r2 + ($r2 * $desired_alpha)) / $desired_alpha;
  $g1: ($g3 - $g2 + ($g2 * $desired_alpha)) / $desired_alpha;
  $b1: ($b3 - $b2 + ($b2 * $desired_alpha)) / $desired_alpha;
  outline: rgba($r1, $g1, $b1, $desired_alpha) 6px solid !important;
  //box-shadow: 0 0 0 6px rgba($r1, $g1, $b1, $desired_alpha) !important;
}

.speaker {
  width: 50px;
  height: 50px;
  background-color: #2c3e50;
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 5;
}
.active {
  @include alpha-color(#3ac184, 0.8, white);
}
</style>
