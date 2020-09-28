// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

const path = require('path');
const express = require('express');
const proxy = require('express-http-proxy');

const port = 8000;
const app = express();
const staticPath = path.join(__dirname, 'web');
let apiUrl = process.env.VZ_API_URL;
if (!apiUrl) {
  if (process.env.VERRAZZANO_OPERATOR_SERVICE_HOST && process.env.VERRAZZANO_OPERATOR_SERVICE_PORT_API) {
    apiUrl = "http://" + process.env.VERRAZZANO_OPERATOR_SERVICE_HOST + ":" + process.env.VERRAZZANO_OPERATOR_SERVICE_PORT_API;
  } else {
    throw new Error("VZ_API_URL not specified and in-pod environment variables VERRAZZANO_OPERATOR_SERVICE_HOST/VERRAZZANO_OPERATOR_SERVICE_PORT_API not available. Aborting..");
  }
}

/**
 * Uses environment variables specified at build time to generate an env.js file in the Javascript output directory
 * The env.js file is sourced by index.html to make those values available to the application at runtime.
 */
function createEnvJs() {
  const fs = require('fs');
  const envJsFilePath = path.join(staticPath, 'js/env.js');
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
      `var vzUiUrl = "${process.env.VZ_UI_URL}"; var vzKeycloakUrl = "${process.env.VZ_KEYCLOAK_URL}"; var vzAuth = "${process.env.VZ_AUTH || true}"; var vzClientId = "${process.env.VZ_CLIENT_ID}"`,
      { flag: 'wx' }
    );
    console.log(`${envJsFilePath} created.`);
  } catch (e) {
    console.log(`Failed creating ${envJsFilePath}: ${e}`);
    throw e
  }
}

createEnvJs();
app.use(express.static(staticPath));

app.use('/api', proxy(apiUrl, {
  proxyReqOptDecorator: function(proxyReqOpts, _) {
    proxyReqOpts.rejectUnauthorized = false // Don't do 2-way SSL verification
    return proxyReqOpts;
  }
}));

app.get('/models', (req, res, next) => {
  res.redirect(`/?ojr=instance&selectedItem=models`)
});
app.get('/bindings', (req, res, next) => {
  res.redirect(`/?ojr=instance&selectedItem=bindings`)
});
app.get('/models/:id', (req, res, next) => {
  res.redirect(`/?ojr=model&modelId=${req.params.id}`)
});
app.get('/bindings/:id', (req, res, next) => {
  res.redirect(`/?ojr=binding&bindingId=${req.params.id}`)
});
app.get('/models/:id/:selectedItem', (req, res, next) => {
  res.redirect(`/?ojr=model&modelId=${req.params.id}&selectedItem=${req.params.selectedItem}`)
});
app.get('/bindings/:id/:selectedItem', (req, res, next) => {
  res.redirect(`/?ojr=binding&bindingId=${req.params.id}&selectedItem=${req.params.selectedItem}`)
});

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==>Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
