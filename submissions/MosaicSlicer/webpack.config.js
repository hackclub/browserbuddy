const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
  {
    name: "app_main",
    entry: "./src/index.mjs",
    output: {
      filename: "js/app.mjs",
      library: {
        type: "module"
      },
      assetModuleFilename: (path_data) => {
        let file_type = path_data.filename.split(".").at(-1);
        let file_path = "misc";
        if (["js", "mjs", "wasm"].includes(file_type))
          file_path = "js";
        else if (["woff", "woff2"].includes(file_type))
          file_path = "fonts";
        return `${file_path}/[name].[hash][ext][query]`;
      }
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new CopyPlugin({
        patterns: [
          {from: "public", to: "."}
        ]
      })
    ],
    resolve: {
      fallback: {
        "url": false,
        "fs": false,
        "path": false,
        "module": false
      },
      alias: {
        "cura_icons": path.join(__dirname, "./third_party/Cura/resources/themes/cura-light/icons")
      }
    },
    module: {
      rules: [
        {
          test: /\.wasm/,
          type: "asset/resource"
        },
        {
          test: /\.svg/,
          type: "asset/inline"
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader"
          ]
        }
      ]
    },
    mode: "development",
    devtool: "source-map",
    experiments: {
      topLevelAwait: true,
      outputModule: true
    }
  }
];
