var webpack = require("webpack");
var webpackMerge = require('webpack-merge');
var commonConfig = require("./webpack.common.js");

// process.env.ENV = 'prod';

var config = {
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        "ENV": '"development"'
      }
    })
  ]
};
module.exports = webpackMerge(commonConfig, config);