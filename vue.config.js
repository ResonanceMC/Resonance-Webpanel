// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const { VuetifyLoaderPlugin } = require("vuetify-loader");
module.exports = {
  transpileDependencies: ["vuetify"],
  devServer: {
    disableHostCheck: true,
    compress: true
  },
  chainWebpack: config => {
    config.plugin("VuetifyLoaderPlugin").tap(() => [
      {
        progressiveImages: true,
        sharp: true
      }
    ]);
  },
  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000
      }
    }
  }
};
