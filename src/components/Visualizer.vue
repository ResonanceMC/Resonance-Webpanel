<template>
  <v-container id="render_pane" style="height: 85%; z-index:0"> </v-container>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import * as THREE from "three";

// Not Working yet
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { Player } from "@/helpers/interfaces";

// const time = performance.now() / 1000;

export default Vue.extend({
  name: "Visualizer",
  props: {
    players: {
      type: Array as PropType<Player[]>,
      required: true,
      validator: function(arr: Player[]) {
        return arr.every(obj => "data" in obj);
      }
    }
  },
  data() {
    return {
      camera: null as PerspectiveCamera | null,
      controls: null as OrbitControls | null,
      scene: null as Scene | null,
      renderer: null as WebGLRenderer | null,
      stats: Stats()
    };
  },
  watch: {
    players(val: Player[]) {
      if (val.length > 0) this.render();
    }
  },
  methods: {
    onWindowResize() {
      const renderPane = document.querySelector("#render_pane");
      if (!renderPane) return;
      this.camera.aspect = renderPane.clientWidth / renderPane.clientHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(renderPane.clientWidth, renderPane.clientHeight);

      this.render();
    },
    render() {
      this.renderer.render(this.scene, this.camera);
      this.stats.begin();
    }
  },
  mounted() {
    const renderPane = document.querySelector("#render_pane");
    if (!renderPane) return;
    this.stats.showPanel(0);
    renderPane.appendChild(this.stats.dom);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    //scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(renderPane.clientWidth, renderPane.clientHeight);
    renderPane.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      60,
      renderPane.clientWidth / renderPane.clientHeight,
      1,
      1000
    );
    // TODO: Follow Player
    this.camera.position.set(25, 25, 0);

    // controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.addEventListener("change", this.render); // call this only in static scenes (i.e., if there is no animation loop)

    // cant be used with static frame
    //controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    //controls.dampingFactor = 0.05;

    this.controls.minDistance = 10;
    this.controls.maxDistance = 50;

    // how far down you can angle the camera && disable moving
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.enablePan = false;

    // const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial();

    material.side = THREE.DoubleSide;

    /*
        const mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = Math.random() * 32 - 40;
        mesh.position.y = 0;
        mesh.position.z = Math.random() * 32 - 40;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        scene.add( mesh );
    */

    window.addEventListener("resize", this.onWindowResize);
  }
});
</script>

<style scoped></style>
