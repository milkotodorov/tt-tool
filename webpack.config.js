const path = require("path");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  mode: process.NODE_ENV || "development",
  entry: ["./src", "./css/common.css"],
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
        test: /\.node$/,
        use: [
          {
            loader: "native-addon-loader",
            options: {name: "[name]-[hash].[ext]"}
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/common.css"
    })
  ]
};
