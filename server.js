// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

path = require('path');
express = require('express');

const port = 8183;
const app = express();
const staticPath = path.join(__dirname, 'web');

app.use(express.static(staticPath));
app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==>Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
