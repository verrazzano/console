// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

'use strict';

const fs = require('fs');
module.exports = function (configObj) {
  return new Promise((resolve, reject) => {
    console.log("Running after_app_typescript hook.");
    // JET does not support the use of process.env in Javascript/Typescript runtime code.
    // Instead, they recommend using these build time hooks to replace env vars in code,
    // using placeholders if needed.
    const authConstantsFile = 'web/js/auth/AuthConstants.js';
    console.log(`Reading authconstants file ${authConstantsFile} to replace environment variable placeholders`);
    fs.readFile(authConstantsFile, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        reject(configObj);
      } else {
        const result = data.replace('@@VZ_CLIENT_ID@@', process.env.VZ_CLIENT_ID || '')
            .replace('@@VZ_UI_URL@@', process.env.VZ_UI_URL || '')
            .replace('@@VZ_AUTH@@', process.env.VZ_AUTH || 'true')
            .replace('@@VZ_KEYCLOAK_URL@@', process.env.VZ_KEYCLOAK_URL || "");
        fs.writeFile(authConstantsFile, result, err => {
          if (err) {
            console.log(`Failed to replace auth constants with env vars! ${err}`);
          } else {
            console.log(`Saved modified ${authConstantsFile} with specified env vars`);
          }
        });
      }
    });
    resolve(configObj);
  });
};
