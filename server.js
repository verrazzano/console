// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

path = require('path');
express = require('express');
proxy = require('express-http-proxy');

const port = 8000;
const app = express();
const staticPath = path.join(__dirname, 'web');
let apiUrl = process.env.VZ_API_URL;
if (!apiUrl) {
  if (process.env.VERRAZZANO_OPERATOR_SERVICE_HOST && process.env.VERRAZZANO_OPERATOR_SERVICE_PORT_API) {
    apiUrl = "http://" + process.env.VERRAZZANO_OPERATOR_SERVICE_HOST + ":" + process.env.VERRAZZANO_OPERATOR_SERVICE_PORT_API;
  } else {
    throw "VZ_API_URL not specified and in-pod environment variables VERRAZZANO_OPERATOR_SERVICE_HOST/VERRAZZANO_OPERATOR_SERVICE_PORT_API not available. Aborting..";
  }
}

app.use(express.static(staticPath));

app.use('/api', proxy(apiUrl, {
  proxyReqOptDecorator: function(proxyReqOpts, _) {
    proxyReqOpts.rejectUnauthorized = false // Don't do 2-way SSL verification
    return proxyReqOpts;
  }
}));

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==>Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
