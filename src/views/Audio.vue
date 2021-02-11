<template>
  <!--  <v-fade-transition hide-on-leave>-->
  <v-container class="overflow-hidden" fill-height fluid>
    <AudioHandler />
  </v-container>
  <!--  </v-fade-transition>-->
</template>

<script lang="ts">
import Vue from "vue";
import AudioHandler from "@/components/AudioHandler.vue";

export default Vue.extend({
  name: "Audio",
  components: { AudioHandler }
});
</script>
