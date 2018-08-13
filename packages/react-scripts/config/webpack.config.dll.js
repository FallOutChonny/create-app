'use strict';

const path = require('path');
const webpack = require('webpack');
const paths = require('./paths');
const pkg = require(paths.appPackageJson);

// Read the dll configuration from package.json
const servedPath = paths.appDLL;

module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  entry: {
    vendors: [...Object.keys(pkg.devDependencies)],
  },
  performance: {
    hints: false,
  },
  output: {
    path: servedPath,
    filename: '[name].js',
    library: '[name]_[hash]',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(servedPath, '[name].json'),
      name: '[name]_[hash]',
    }),
  ],
};
