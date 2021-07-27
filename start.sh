#!/bin/bash
#
# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
set -x
node generate-env.js
ENV_JS_HASH=$(cat web/js/env.js | openssl dgst -sha384 -binary | openssl base64 -A)
sed "s;ENV_JS_INTEGRITY_VALUE;${ENV_JS_HASH};g" -i web/index.html
node server.js
