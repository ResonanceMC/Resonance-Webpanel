module.exports = {
  transpileDependencies: ["vuetify"],
  chainWebpack: config => {
    config.plugin("VuetifyLoaderPlugin").tap(() => [
      {
        progressiveImages: {
          sharp: true
          // resourceQuery: /lazy\?vuetify-preload/
        }
      }
    ]);
  }
};
