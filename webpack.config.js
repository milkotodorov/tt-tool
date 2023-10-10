const path = require("path")
const {CleanWebpackPlugin} = require("clean-webpack-plugin")
const CopyPlugin = require('copy-webpack-plugin')
const {platform, arch} = require('os')

module.exports = {
  mode: process.NODE_ENV || "development",
  entry: ["./src"],
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
      }
    ]
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'css', to: 'css' },
        { from: 'assets', to: 'assets' },
        { from: 'fonts', to: 'fonts' },
        { from: 'tt-tool-config.json', to: 'tt-tool-config.json' },
        // { from: 'node_modules/ffmpeg-static/ffmpeg', noErrorOnMissing: true },
        // { from: 'node_modules/ffmpeg-static/ffmpeg.exe', noErrorOnMissing: true },
        // { from: `node_modules/ffplay-static/bin/${platform()}/${arch()}/ffplay`, noErrorOnMissing: true },
        // { from: `node_modules/ffplay-static/bin/${platform()}/${arch()}/ffplay.exe`, noErrorOnMissing: true }
      ]
    })
  ]
}