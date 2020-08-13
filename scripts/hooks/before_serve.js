// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

'use strict';
const fs = require('fs');
module.exports = function (configObj) {
  return new Promise((resolve, reject) => {
    console.log("Running before_serve hook.");
    try {
      fs.unlinkSync(`web/js/env.js`);
      console.log("Removed existing env.js from build directory.");
    } catch (e) {
      if (e.message.includes('ENOENT')) {
        console.log('No existing env.js in build directory.')
      } else {
        onsole.log('Error deleting existing env.js.')
        console.log(e)
        throw e
      }
    }
    
    try {
      console.log("Creating env.js.");
      fs.writeFileSync(
        `web/js/env.js`,
        `var vzAuth = "${process.env.VZ_AUTH}";apiUrl = "${process.env.API_URL}"`,
        { flag: 'wx' }
      );
      console.log("env.js created.");
    } catch (e) {
      console.log("Failed creating env.js.");
      console.log(e)
      throw e
    }
  	resolve(configObj);
  });
};
