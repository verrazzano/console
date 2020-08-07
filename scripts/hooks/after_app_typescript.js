/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const fs = require('fs');
module.exports = function (configObj) {
  return new Promise((resolve, reject) => {
    console.log("Running after_app_typescript hook.");
    const authConstantsFile = 'web/js/auth/AuthConstants.js';
    console.log(`Reading authconstants file ${authConstantsFile}, going to replace keycloak url with ${process.env.VZ_KEYCLOAK_URL}`);
    fs.readFile(authConstantsFile, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        reject(configObj);
      } else {
        const result = data.replace('@@VZ_CLIENT_ID@@', process.env.VZ_CLIENT_ID || '')
            .replace('@@VZ_UI_URL@@', process.env.VZ_UI_URL || '')
            .replace('@@VZ_AUTH@@', process.env.VZ_AUTH || 'false')
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
