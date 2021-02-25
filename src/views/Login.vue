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
          placeholder="Ex: ABCDEF"
          :loading="loading"
          :error="error"
          height="40px"
        ></v-text-field>
      </v-container>
    </v-container>
  </transition>
</template>

<script>
import Vue from "vue";
import debounce from "lodash/debounce";

export default Vue.extend({
  name: "Login",
  props: {
    token: {
      type: String,
      required: false
    }
  },
  data: () => {
    return {
      inputToken: "",
      loading: false,
      error: false
    };
  },
  watch: {
    inputToken(token) {
      if (token && this.$auth.loaded) this.debounceAuthToken();
    }
  },
  async mounted() {
    if (this.token) {
      this.$router.push({ name: "login" }).then();
      this.inputToken = this.token;
      this.validateInput();
      await this.$auth.waitLoad();
      await this.authToken();
    }
  },
  methods: {
    validateInput() {
      this.inputToken = this.inputToken.replace(/ /g, "").toUpperCase();
      if (
        this.inputToken === "RAZWASHERE" ||
        this.inputToken === "THICCWASHERE" ||
        this.inputToken === "FEDCBA"
      ) {
        this.$auth.error = "Gottem";
        document.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      }
    },
    debounceAuthToken(waitTime = 400) {
      this.validateInput();
      if (!this._debounce) this._debounce = debounce(this.authToken, waitTime);
      this._debounce();
    },
    async authToken() {
      if (this.inputToken.length === 0 || this.loading) return;
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
