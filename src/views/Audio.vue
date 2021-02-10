<template>
  <AudioHandler />
</template>

<script lang="ts">
import Vue from "vue";
import AudioHandler from "@/components/AudioHandler.vue";

export default Vue.extend({
  name: "Audio",
  components: { AudioHandler }
});
</script>
