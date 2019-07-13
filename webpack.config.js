const path = require('path')
const webpack = require('webpack')
// const fs = require('fs');

module.exports = {
  mode: 'development',
  entry: ['./src/index.js'],

  // Use brfs & transform-loader to use 'fs' module in the front pages
  // Because browser access problem, 'fs' cannot used to read file in
  // the frontend. 'brfs' is a 'browserify' plugin that partially solves
  // this problem by read file in the building stage.

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
	use: {
	  loader: 'babel-loader',
	  options: {
	    presets: ['@babel/preset-env', '@babel/preset-react'],
	    plugins: [ "@babel/plugin-transform-runtime"]
	  }
	},
        
	
      }
      //      {
      //        test: /\hicviewer.js$/,
      //        loader: "transform-loader?brfs"
      //      },

    ]
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 7777
  },
  //resolve: {
  //  alias: {
  //    'three/OrbitControls': path.join(__dirname, 'node_modules/three/examples/js/controls/OrbitControls.js')
  //  }
  //},
  //plugins: [
  //  new webpack.ProvidePlugin({
  //    'THREE': 'three'
  //  })
  //]

}
