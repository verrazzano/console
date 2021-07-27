#!/bin/bash
#
# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
set -x
node generate-env.js
ENV_JS_HASH=$(cat web/js/env.js | openssl dgst -sha384 -binary | openssl base64 -A)
REQUIRE_JS_HASH=$(cat web/js/libs/require/require.js | openssl dgst -sha384 -binary | openssl base64 -A)
MAIN_JS_HASH=$(cat web/js/main.js | openssl dgst -sha384 -binary | openssl base64 -A)
sed -e "s;ENV_JS_INTEGRITY_VALUE;${ENV_JS_HASH};g" -e "s;REQUIRE_JS_INTEGRITY_VALUE;${REQUIRE_JS_HASH};g" -e "s;MAIN_JS_INTEGRITY_VALUE;${MAIN_JS_HASH};g" -i web/index.html
node server.js
