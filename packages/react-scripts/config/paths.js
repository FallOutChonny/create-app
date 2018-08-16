// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');
const findMonorepo = require('react-dev-utils/workspaceUtils').findMonorepo;

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(inputPath, needsSlash) {
  const hasSlash = inputPath.endsWith('/');
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  } else {
    return inputPath;
  }
}

const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
  const publicUrl = getPublicUrl(appPackageJson);
  const servedUrl =
    envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
  return ensureSlash(servedUrl, true);
}

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp('.env'),
  appRoot: resolveApp('/'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('build'),
  appCache: resolveApp('node_modules/.cache-loader'),
  appDLL: resolveApp('build/dll'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appServerIndexJs: resolveApp('src/index.js'),
  appClientIndexJs: resolveApp('src/client.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  testsSetup: resolveApp('src/setupTests.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
  assetsManifest: resolveApp('build/assets.json'),
  vendorManifest: resolveApp('build/dll/vendors.json'),
};

let checkForMonorepo = true;

// @remove-on-eject-begin
const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);

// config before eject: we're in ./node_modules/react-scripts/config/
module.exports = {
  dotenv: resolveApp('.env'),
  appRoot: resolveApp('/'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('build'),
  appCache: resolveApp('node_modules/.cache-loader'),
  appPublic: resolveApp('public'),
  appDLL: resolveApp('build/dll'),
  appHtml: resolveApp('public/index.html'),
  appServerIndexJs: resolveApp('src/index.js'),
  appClientIndexJs: resolveApp('src/client.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  testsSetup: resolveApp('src/setupTests.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
  assetsManifest: resolveApp('build/assets.json'),
  vendorManifest: resolveApp('build/dll/vendors.json'),
  // These properties only exist before ejecting:
  ownPath: resolveOwn('.'),
  ownNodeModules: resolveOwn('node_modules'), // This is empty on npm 3
};

// detect if template should be used, ie. when cwd is react-scripts itself
const useTemplate =
  appDirectory === fs.realpathSync(path.join(__dirname, '..'));

checkForMonorepo = !useTemplate;

if (useTemplate) {
  module.exports = {
    dotenv: resolveOwn('template/.env'),
    appPath: resolveApp('.'),
    appRoot: resolveApp('../../'),
    appBuild: resolveOwn('../../build'),
    appCache: resolveApp('../../node_modules/.cache-loader'),
    appDLL: resolveApp('../../build/dll'),
    appPublic: resolveOwn('template/public'),
    appHtml: resolveOwn('template/public/index.html'),
    appServerIndexJs: resolveApp('template/src/index.js'),
    appClientIndexJs: resolveApp('template/src/client.js'),
    appPackageJson: resolveOwn('package.json'),
    appSrc: resolveOwn('template/src'),
    testsSetup: resolveOwn('template/src/setupTests.js'),
    appNodeModules: resolveOwn('node_modules'),
    publicUrl: getPublicUrl(resolveOwn('package.json')),
    servedPath: getServedPath(resolveOwn('package.json')),
    assetsManifest: resolveApp('../../build/assets.json'),
    vendorManifest: resolveApp('../../build/dll/vendors.json'),
    // These properties only exist before ejecting:
    ownPath: resolveOwn('.'),
    ownNodeModules: resolveOwn('node_modules'),
  };
}
// @remove-on-eject-end

module.exports.srcPaths = [module.exports.appSrc];

module.exports.useYarn = fs.existsSync(
  path.join(module.exports.appPath, 'yarn.lock')
);

if (checkForMonorepo) {
  // if app is in a monorepo (lerna or yarn workspace), treat other packages in
  // the monorepo as if they are app source
  const mono = findMonorepo(appDirectory);
  if (mono.isAppIncluded) {
    Array.prototype.push.apply(module.exports.srcPaths, mono.pkgs);
  }
  module.exports.useYarn = module.exports.useYarn || mono.isYarnWs;
}
