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
</style>
<script>
import OverlayLoader from "@/components/OverlayLoader";
export default {
  components: { OverlayLoader }
};
</script>
