const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map'
  // NOTE: also using MiniCssExtractPlugin in prod,
  // but config is currently behind a mode=prod ternary
  // in webpack.common.js
});
