<template>
  <v-fade-transition hide-on-leave>
    <v-container fill-height fluid>
      <v-row justify="center" align="center">
        <!-- lazy-src="~@/assets/lazy-logo.png"  // generate: ffmpeg -i logo.png -filter_complex "boxblur=100,scale=120:-1" lazy-logo.png-->
        <v-img
          alt="Resonance logo"
          src="~@/assets/logo.png"
          transition="scale-transition"
          style="height:50vh"
          class="shrink mt-n16"
          contain
        />
      </v-row>
      <!--    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />-->
    </v-container>
  </v-fade-transition>
</template>

<script lang="ts">
// import { Component, Vue } from "vue-property-decorator";
import Vue from "vue";
// import HelloWorld from "@/components/HelloWorld.vue"; //
// @ is an alias to /src
export default Vue.extend({
  name: "Home"
});
</script>
