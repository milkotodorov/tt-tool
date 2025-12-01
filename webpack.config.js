const path = require("path")
const {CleanWebpackPlugin} = require("clean-webpack-plugin")
const CopyPlugin = require('copy-webpack-plugin')
const PermissionsOutputPlugin = require('webpack-permissions-plugin')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals') 

module.exports = {
  mode: process.NODE_ENV || "development",
  entry: ["./src/index.ts"],
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },
  externals: [nodeExternals()], 
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
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
      }
    ]
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"]
  },

  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(`${process.env.npm_package_version}`)
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'css', to: 'css' },
        { from: 'assets', to: 'assets' },
        { from: 'fonts', to: 'fonts' },
        { from: 'tt-tool-config.json' },
        { from: 'whisper-models-config.json' },
        { from: 'node_modules/ffmpeg-static/ffmpeg', noErrorOnMissing: true },
        { from: 'node_modules/ffmpeg-static/ffmpeg.exe', noErrorOnMissing: true }
      ]
    }),
    new PermissionsOutputPlugin({
      buildFiles: [
        {
          path: path.resolve(__dirname, 'dist/ffmpeg'),
          fileMode: '755'
        }
      ]
    })
  ]
}