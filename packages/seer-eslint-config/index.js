/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var eslintConfig = require('eslint-config-react-app');

module.exports = Object.assign({}, eslintConfig, {
  globals: {
    __CLIENT__: true,
    __SERVER__: true,
    __DLLS__: true,
  },
});
