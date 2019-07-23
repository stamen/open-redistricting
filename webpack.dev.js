const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		historyApiFallback: true,
		hot: true,
		port: 3000,
		publicPath: '/'
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
});
