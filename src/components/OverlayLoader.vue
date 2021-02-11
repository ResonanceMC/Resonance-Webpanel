<template>
  <!--  <v-fade-transition>-->
  <div class="text-center">
    <v-overlay :value="active" opacity="0.7">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
  <!--  </v-fade-transition>-->
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "OverlayLoader",
  props: {
    active: Boolean
  }
});
</script>
