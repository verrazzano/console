// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"use strict";

module.exports = function (configObj) {
  // Typescript configuration can be found in configObj.typescript
  return new Promise((resolve) => {
    console.log("Running before_app_typescript hook.");
    resolve(configObj);
  });
};
