const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

const OUTPUT = 'dist';

module.exports = merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		contentBase: path.resolve(__dirname, OUTPUT),
		hot: true,
		port: 3000
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
});
