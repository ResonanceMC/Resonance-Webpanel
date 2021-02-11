<template>
  <v-fade-transition hide-on-leave>
    <v-container fill-height fluid>
      <v-row justify="center" align="center">
        <v-img
          alt="Resonance logo"
          src="../assets/Artboard 12-@4x.png?lazy"
          style="height:50vh"
          transition="scale-transition"
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
