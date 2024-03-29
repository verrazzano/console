#!/bin/bash
#
# Copyright (c) 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
set -x
echo "Calculating and substituting integrity hash for static resources in index.html"
REQUIRE_JS_HASH=$(echo sha384-$(openssl dgst -sha384 -binary web/js/libs/require/require.js | openssl base64 -A))
MAIN_JS_HASH=$(echo sha384-$(openssl dgst -sha384 -binary web/js/main.js | openssl base64 -A))
FAVICO_HASH=$(echo sha384-$(openssl dgst -sha384 -binary web/css/images/favico.svg | openssl base64 -A))
REDWOOD_CSS_HASH=$(echo sha384-$(openssl dgst -sha384 -binary web/css/redwood/10.1.0/web/redwood.min.css | openssl base64 -A))
DEMO_ALTA_CSS_HASH=$(echo sha384-$(openssl dgst -sha384 -binary web/css/demo-alta-site.css | openssl base64 -A))
UNIXFONT_CSS_HASH=$(echo sha384-$(openssl dgst -sha384 -binary web/css/ojuxIconFont.min.css | openssl base64 -A))
APP_CSS_HASH=$(echo sha384-$(openssl dgst -sha384 -binary web/css/app.css | openssl base64 -A))
sed -i.bk -e "s;REQUIRE_JS_INTEGRITY_VALUE;${REQUIRE_JS_HASH};g" -e "s;MAIN_JS_INTEGRITY_VALUE;${MAIN_JS_HASH};g" -e "s;FAVICO_INTEGRITY_VALUE;${FAVICO_HASH};g" -e "s;id=\"css\";id=\"css\" integrity=\"${REDWOOD_CSS_HASH}\";g" -e "s;DEMO_ALTA_CSS_INTEGRITY_VALUE;${DEMO_ALTA_CSS_HASH};g" -e "s;UNIXFONT_CSS_INTEGRITY_VALUE;${UNIXFONT_CSS_HASH};g" -e "s;APP_CSS_INTEGRITY_VALUE;${APP_CSS_HASH};g" web/index.html

