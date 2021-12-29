const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webgl.bundle.js',
  },
  module: {
    rules: [{ test: /\.vert|\.frag$/, type: 'asset/source', }],
  },
  plugins: [new HtmlWebpackPlugin({ template: './index.html' })],
};