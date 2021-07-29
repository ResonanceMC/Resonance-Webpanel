// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const { VuetifyLoaderPlugin } = require("vuetify-loader");
const CopyWebpackPlugin = require("copy-webpack-plugin");

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
    },
    plugins: [
      new CopyWebpackPlugin([
        {
          from: "src/config",
          to: "config",
          transform(content) {
            return content
              .toString()
              .replace("__PORT__", process.env.port ?? "")
              .replace("__HOST__", process.env.host ?? "")
              .replace("__REF_DISTANCE__", process.env.refDistance ?? "3")
              .replace("__MAX_DISTANCE__", process.env.maxDistance ?? "20");
          },
          ignore: [".DS_Store"]
        }
      ])
    ]
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
