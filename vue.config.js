// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const { VuetifyLoaderPlugin } = require("vuetify-loader");
module.exports = {
  transpileDependencies: ["vuetify"],
  devServer: {
    disableHostCheck: true,
    compress: true
  },
  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000
      }
    }
  },
  chainWebpack: config => {
    config.plugin("VuetifyLoaderPlugin").tap(() => [
      {
        progressiveImages: true,
        sharp: true
      }
    ]);

    config.plugin("fork-ts-checker").tap(args => {
      args[0].memoryLimit = 4096;
      args[0].workers = 4;
      return args;
    });
  }
};
