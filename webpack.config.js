const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'frontend', 'src', 'scripts', 'main.ts'),   
    stat: path.resolve(__dirname, 'frontend', 'src', 'scripts', 'stat.ts'),
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname,"frontend", 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'], 
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template:  path.resolve(__dirname, 'frontend', 'src', 'pages', 'index.html'), 
      filename: 'index.html', 
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'frontend', 'src', 'pages', 'stat.html'), 
      filename: 'stat.html', 
      chunks: ['stat'],
    }),
    new CopyWebpackPlugin({
      patterns:[
        {from: './config.json', to: 'config.json'}
      ],
    }),
  ],
  mode: 'development',
};