const path = require("path");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  mode: process.NODE_ENV || "development",
  entry: ["./src", "./css/common.css", "./tt-tool-config.json"],
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {publicPath: "dist"}
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      // {
      //   test: /\.json$/,
      //   type: "javascript/auto",
      //   loader: "file-loader",
      //   options: {
      //     name: "[name].[ext]"
      //   }
      // },
      {
        test: /\.node$/,
        use: [
          {
            loader: "native-addon-loader",
            options: {name: "[name]-[hash].[ext]"}
          }
        ]
      }
    ]
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx", "*.json"]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/common.css"
    })
  ]
}