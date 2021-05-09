// 进度条插件
const SimpleProgressPlugin = require('webpack-simple-progress-plugin');
// 打包后文件大小分析插件
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
let plugins = [];
if (process.env.NODE_ENV === 'production') {
	plugins.push(new SimpleProgressPlugin());
	plugins.push(new BundleAnalyzerPlugin());
}
module.exports = {
	configureWebpack: {
    plugins,
		resolve: {
			extensions: [ '.js', '.vue', '.json', '.ts' ]
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					loader: 'ts-loader',
					exclude: /node_modules/,
					options: {
						appendTsSuffixTo: [ /\.vue$/ ]
					}
				}
			]
		}
	}
};
