module.exports = {
  transpileDependencies: ["vuetify"],
  devServer: {
    disableHostCheck: true,
    compress: true
  },
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
