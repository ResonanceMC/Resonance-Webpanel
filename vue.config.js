/* eslint-disable @typescript-eslint/camelcase, @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

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
  },
  pwa: {
    name: "Resonance: Proximity Chat",
    themeColor: "#f0a31b",
    appleMobileWebAppCapable: "yes",

    manifestOptions: {
      short_name: "Resonance",
      name: "Resonance: Proximity Chat",
      icons: [
        {
          src: "/img/icons/logo-192.png",
          type: "image/png",
          sizes: "192x192"
        },
        {
          src: "/img/icons/logo-512.png",
          type: "image/png",
          sizes: "512x512"
        }
      ],
      start_url: "/",
      background_color: "#ffffff",
      display: "minimal-ui",
      scope: "/",
      theme_color: "#f0a31b",
      shortcuts: [
        {
          name: "Resonance: Audio Chat",
          short_name: "Audio Chat",
          description: "Open proximity chat directly",
          url: "/audio",
          icons: [{ src: "/img/icons/logo-192.png", sizes: "192x192" }]
        }
      ],
      description: "Proximity chat mod and plugin for Minecraft servers."
    },
    iconPaths: {
      favicon32: "img/icons/favicon-32.png",
      favicon16: "img/icons/favicon-16.png",
      appleTouchIcon: "img/icons/apple-touch-icon-152.png",
      maskIcon: null,
      msTileImage: null
    },

    workboxOptions: {
      navigateFallback: "index.html",
      // additionalManifestEntries: [
      //   { url: "/config/settings.js", revision: null }
      // ],
      cleanupOutdatedCaches: true
    }
  }
};
