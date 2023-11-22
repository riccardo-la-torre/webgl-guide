const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin"); //installed via npm
const webpack = require("webpack"); //to access built-in plugins

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "development" : "production",
  entry: "./index.js",
  output: {
    clean: true,
    path: path.resolve(__dirname, "docs"),
    filename:
      process.env.NODE_ENV === "production"
        ? "webgl.[contenthash].bundle.js"
        : "webgl.bundle.js",
  },
  module: {
    rules: [
      { test: /\.vert|\.frag$/, type: "asset/source" },
      { test: /\.jpg$/, type: "asset" },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: "./index.html" })],
};
