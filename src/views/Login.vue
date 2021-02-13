<template>
  <transition name="fade" appear mode="out-in">
    <v-container
      fill-height
      fluid
      class="justify-center d-flex transition-swing dark"
    >
      <v-container class="elevation-3 white" style="max-width: 1000px">
        <h1 class="text-center header">Login to Resonance</h1>
        <v-text-field
          label="Token"
          v-model="inputToken"
          class="pt-3"
          autofocus
          placeholder="Ex: DYlbyU_vmYU"
          :loading="loading"
          :error="error"
          background-color="white"
          height="40px"
          @blur="authToken"
          @keydown.enter="authToken"
        ></v-text-field>
      </v-container>
    </v-container>
  </transition>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "Login",
  data: () => {
    return {
      inputToken: null,
      loading: false,
      error: false
    };
  },
  methods: {
    async authToken() {
      if (!this.inputToken || this.loading) return;
      this.loading = true;
      const result = await this.$auth.authToken(this.inputToken);
      this.loading = false;

      if (result) await this.$router.push({ name: "audio-test" });
      else {
        this.error = true;
        setTimeout(() => {
          this.error = false;
        }, 500);
      }
    }
  }
});
</script>

<style scoped lang="scss">
.dark {
  background-color: #e6eaea;
}
</style>
