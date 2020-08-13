// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

'use strict';

function createEnvJs() {
  const fs = require('fs');
  const envJsFilePath = 'web/js/env.js';
  try {
    fs.unlinkSync(envJsFilePath);
    console.log(`Removed existing environment file ${envJsFilePath}`);
  } catch (e) {
    if (e.message.includes('ENOENT')) {
      console.log(`No existing ${envJsFilePath} found`)
    } else {
      console.log(`Error deleting existing ${envJsFilePath}: ${e}`)
      throw e
    }
  }

  try {
    console.log("Creating env.js.");
    fs.writeFileSync(
      `${envJsFilePath}`,
      `const vzUiUrl = "${process.env.VZ_UI_URL}"; const vzKeycloakUrl = "${process.env.VZ_KEYCLOAK_URL}"; const vzAuth = "${process.env.VZ_AUTH || true}"; const vzClientId = "${process.env.VZ_CLIENT_ID}";`,
      { flag: 'wx' }
    );
    console.log(`${envJsFilePath} created.`);
  } catch (e) {
    console.log(`Failed creating ${envJsFilePath}: ${e}`);
    throw e
  }
}

module.exports = function (configObj) {
  return new Promise((resolve, reject) => {
    console.log("Running before_serve hook.");
    createEnvJs();
    resolve(configObj);
  });
};
