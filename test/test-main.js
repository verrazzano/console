// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, "");
    allTestFiles.push("../../" + normalizedTestModule);
  }
});

function _ojIsIE11() {
  var nAgt = navigator.userAgent;
  return nAgt.indexOf("MSIE") !== -1 || !!nAgt.match(/Trident.*rv:11./);
}
var _ojNeedsES5 = _ojIsIE11();
console.log("ALL TEST FILES");
console.log(allTestFiles);

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: "/base/web/js",

  // Configure RequireJS path mappings
  // Note that every file listed here must also be listed in Karma's "files" array
  paths: {
    jquery: "libs/jquery/jquery-3.5.1",
    ojs: "libs/oj/current/debug" + (_ojNeedsES5 ? "_es5" : ""),
    ojL10n: "libs/oj/current/ojL10n",
    ojtranslations: "libs/oj/current/resources",
    sinon: "../../node_modules/sinon/pkg/sinon",
    "vz-console": "jet-composites/vz-console/1.0.0",
    knockout: "libs/knockout/knockout-3.5.1.debug",
    "jqueryui-amd": "libs/jquery/jqueryui-amd-1.12.1",
    "js-yaml": "libs/js-yaml/js-yaml.min",
    hammerjs: "libs/hammer/hammer-2.0.8",
    touchr: "libs/touchr/touchr",
    customElements: "libs/webcomponents/custom-elements.min",
    ojdnd: "libs/dnd-polyfill/dnd-polyfill-1.0.2",
    text: "libs/require/text",
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start,
});
