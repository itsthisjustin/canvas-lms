/*
 * Copyright (C) 2014 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

var glob = require('glob');
var path = require('path');
var K = require('./constants');
var PKG_PATH = path.join(K.root, 'vendor/packages');
var PKG_PATH_RJS = '../../../vendor/packages';

// Look for all the packages in vendor/packages/**/*.js and create an "empty:"
// map containing all the package paths.
//
// This will instruct the r.js optimizer to ignore these packages when we're
// building _locally_. and find them at Canvas build-time (at which point,
// Canvas will provide them.)
//
// For example, the following files will produce the map below:
//
//     // file 1: /vendor/packages/jquery.js
//     // file 2: /vendor/packages/jqueryui/dialog.js
//
//     {
//       "../../../vendor/packages/jquery": "empty:",
//       "../../../vendor/packages/jqueryui/dialog": "empty:"
//     }
//
// If a package is aliased (for convenience), its alias will also be properly
// stubbed. For example, if the app allows use of the "react" package by both
// "canvas_packages/react" and "react" module IDs, then we get something like
// this:
//
//     {
//       "../../../vendor/packages/react": "empty:",
//       "react": "empty:"
//     }
//
module.exports = function() {
  var devConfig = require('./extract_development_config')();
  var pkgMap = glob.sync('**/*.js', { cwd: PKG_PATH }).reduce(function(set, pkg) {
    var pkgName = pkg.replace(/\.js$/, '');

    set[PKG_PATH_RJS + '/' + pkgName] = 'empty:';

    // We'll also have to stub aliases to commonly used canvas packages, like
    // "react" for example.
    //
    // These aliases are defined in /config/requirejs/development.js and
    // commented as such.
    if (devConfig.paths.hasOwnProperty(pkgName)) {
      set[pkgName] = 'empty:';
    }

    return set;
  }, {});

  return pkgMap;
};