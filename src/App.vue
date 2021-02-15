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
      <router-link :to="{ name: 'audio-test' }">Audio Test</router-link>
      <span v-if="$auth.authed"> | </span>
      <router-link
        v-if="$auth.authed"
        :to="{ name: 'login' }"
        @click.native="$auth.logout"
        >Logout</router-link
      >
    </v-container>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style lang="scss">
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
<script>
import OverlayLoader from "@/components/OverlayLoader";
export default {
  components: { OverlayLoader }
};
</script>
