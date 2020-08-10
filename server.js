// Copyright (C) 2020, Oracle and/or its affiliates.
path = require('path');
express = require('express');
cors = require('cors')

const port = 8183;
const app = express();
const staticPath = path.join(__dirname, 'web');

app.use(cors());
app.use(express.static(staticPath));
app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
