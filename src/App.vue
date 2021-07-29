<template>
  <v-app id="app">
    <OverlayLoader :active="!$auth.loaded"></OverlayLoader>
    <v-dialog :value="$auth.error" max-width="fit-content">
      <v-card>
        <v-card-title class="justify-center headline pa-5">
          {{ $auth.error }}
        </v-card-title>
      </v-card>
    </v-dialog>
    <v-container fluid id="nav">
      <router-link :to="{ name: 'home' }">Home</router-link> |
      <router-link :to="{ name: 'audio-chat' }">Audio Chat</router-link> |
      <router-link :to="{ name: 'audio-test' }">Test Audio</router-link>
      <span v-if="$auth.authed"> | </span>
      <a v-if="$auth.authed" href="" @click="logout">Logout</a>
    </v-container>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style lang="scss">
html,
body {
  position: fixed;
  overflow: hidden;
  width: 100vw;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
// fade transitions
.fade-enter-active {
  transition: all 0.3s ease;
}
.fade-leave-active {
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
<script lang="ts">
import OverlayLoader from "@/components/OverlayLoader.vue";
import Vue from "vue";

export default Vue.extend({
  components: { OverlayLoader },
  methods: {
    logout(e: MouseEvent) {
      e.preventDefault();
      this.$auth.logout();
    }
  }
});

window.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
});
</script>
