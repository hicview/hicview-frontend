const path = require('path')
const webpack = require('webpack')
// const fs = require('fs');

module.exports = {
  mode: 'development',
  entry: ['./src/index.ts'],


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
        
	
      },
      {
	test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
 

    ]
  },
  resolve:{
     extensions: [ '.tsx', '.ts', '.js' ]
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
