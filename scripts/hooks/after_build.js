// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

'use strict';

const filesystem = require('fs');
const path = require('path');
module.exports = function (configObj) {
  return new Promise((resolve, reject) => {
      console.log("Running after_build hook.");
      // Create a symlink to the versioned Oracle JET lib dir, so that Karma test/test-main.js can
      // use the symlink directory name and will work irrespective of JET minor version changes
      const ojLibDir = path.resolve('web/js/libs/oj');
      const symlinkPath = `${ojLibDir}/current`;
      const versionedDirRegex = /^v[0-9]+\.[0-9]+\.[0-9]+$/;
      const ojLibVersion = filesystem.readdirSync(ojLibDir).find(
        (name) => name.match(versionedDirRegex) && filesystem.lstatSync(`${ojLibDir}/${name}`).isDirectory());
      console.log(`Oracle JET library version is ${ojLibVersion}, creating symlink ${symlinkPath} to this version for use by test/test-main.js`);
      filesystem.symlinkSync(`${ojLibDir}/${ojLibVersion}/`, symlinkPath);
      resolve(configObj);
  });
};
