#!/bin/bash
#
# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
set -x
node generate-env.js
ENV_JS_HASH=$(echo sha384-$(openssl dgst -sha384 -binary web/js/env.js | openssl base64 -A))
sed -i.bk -e "s;ENV_JS_INTEGRITY_VALUE;${ENV_JS_HASH};g" web/index.html
node server.js
