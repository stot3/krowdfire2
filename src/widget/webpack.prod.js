var webpack = require("webpack");
var webpackMerge = require('webpack-merge');
var commonConfig = require("./webpack.common.js");

var config = {
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        "ENV": '"production"'
      }
    })
  ]
};
module.exports = webpackMerge(commonConfig, config);