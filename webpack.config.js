const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path')

module.exports = {
  mode: 'development',
  entry: './app/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({ template: './app/index.html' })],
  // devtool: 'nosources-source-map',
  devServer: {
    contentBase: './dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { 'targets': { 'chrome': 68 } }],
              '@babel/preset-react'],
            plugins: [require('@babel/plugin-proposal-object-rest-spread')]
          }
        }
      }
    ]
  }
}
