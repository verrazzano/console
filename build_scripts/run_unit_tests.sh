
#!/bin/bash
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

set -e
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH=./node_modules/.bin:${PATH}
nvm use 14.7
ojet build
#npm install puppeteer
#echo "console.log(require('puppeteer').executablePath())" > chrome_version.js
#node chrome_version.js
#export CHROME_BIN="$(node chrome_version.js)"
#echo "Chrome binary is ${CHROME_BIN}"
npm test