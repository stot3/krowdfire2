var webpack = require("webpack");
var webpackMerge = require('webpack-merge');
var commonConfig = require("./webpack.common.js");

var config = {
  devtool: 'inline-source-map',

  resolve: {
    extensions: ['', '.ts', '.js']
  },

  module: {
    loaders: [{
      test: /\.ts$/,
      loaders: ['ts-loader']
    }]
  }
};
module.exports = webpackMerge(commonConfig, config);