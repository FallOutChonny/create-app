'use strict';

const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3001;

const publicUrl = `http://${host}:${port}`;
const envs = getClientEnvironment(publicUrl);

module.exports = env => {
  const config = Object.assign({}, require('./webpack.config.' + env));
  const isDev = env === 'dev';

  config.target = 'node';

  config.node = {
    console: true,
    __filename: true,
    __dirname: true,
  };

  config.externals = [
    'express',
    nodeExternals({
      whitelist: [
        isDev ? 'webpack/hot/poll?1000' : null,
        /\.(eot|woff|woff2|ttf|otf)$/,
        /\.(svg|png|jpg|jpeg|gif|ico)$/,
        /\.(mp4|mp3|ogg|swf|webp)$/,
        /\.(css|scss|sass|sss|less)$/,
      ].filter(x => x),
    }),
  ];

  config.entry = [paths.appServerIndexJs];

  config.output = {
    path: paths.appBuild,
    publicPath: config.output.publicPath,
    filename: 'server.js',
    libraryTarget: 'commonjs2',
  };

  config.module = Object.assign({}, config.module, {
    rules: config.module.rules.map(x => {
      if (x.oneOf) {
        return Object.assign({}, x, {
          oneOf: x.oneOf.map(y => {
            if (y.use) {
              return Object.assign({}, y, {
                use: y.use
                  .slice()
                  .filter(
                    z =>
                      !(
                        z === require.resolve('style-loader') ||
                        z ===
                          require.resolve('mini-css-extract-plugin/dist/loader')
                      )
                  ),
              });
            }
            return y;
          }),
        });
      }
      return x;
    }),
  });

  config.plugins = [
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    new webpack.DefinePlugin(
      Object.assign({}, envs.stringified, {
        __CLIENT__: false,
        __SERVER__: true,
        __DLLS__: true,
      })
    ),
  ];

  if (isDev) {
    config.watch = true;
    config.entry.unshift('webpack/hot/poll?1000');

    config.plugins = config.plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new StartServerPlugin({
        name: 'server.js',
        nodeArgs: ['-r', 'source-map-support/register'],
      }),
      new webpack.WatchIgnorePlugin([paths.assetsManifest]),
    ]);
  }

  delete config.optimization;

  return config;
};
