// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"use strict";

// The UserAgent is used to detect IE11. Only IE11 requires ES5.
// prettier-ignore
(function () {
  function _ojIsIE11() {
    var nAgt = navigator.userAgent;
    return nAgt.indexOf("MSIE") !== -1 || !!nAgt.match(/Trident.*rv:11./);
  }
  var _ojNeedsES5 = _ojIsIE11();

  // eslint-disable-next-line no-undef
  requirejs.config({
    waitSeconds: 25,
    baseUrl: "/js",

    paths:
      /* DO NOT MODIFY
       ** All paths are dynamically generated from the path_mappings.json file.
       ** Add any new library dependencies in path_mappings json file
       */
      // injector:mainReleasePaths
      {
        knockout: "libs/knockout/knockout-3.5.1.debug",
        jquery: "libs/jquery/jquery-3.5.1",
        "jqueryui-amd": "libs/jquery/jqueryui-amd-1.12.1",
        hammerjs: "libs/hammer/hammer-2.0.8",
        ojdnd: "libs/dnd-polyfill/dnd-polyfill-1.0.2",
        ojs: "libs/oj/v10.1.0/debug" + (_ojNeedsES5 ? "_es5" : ""),
        ojL10n: "libs/oj/v10.1.0/ojL10n",
        ojtranslations: "libs/oj/v10.1.0/resources",
        text: "libs/require/text",
        signals: "libs/js-signals/signals",
        customElements: "libs/webcomponents/custom-elements.min",
        proj4: "libs/proj4js/dist/proj4-src",
        css: "libs/require-css/css.min",
        touchr: "libs/touchr/touchr",
        corejs: "libs/corejs/shim",
        chai: "libs/chai/chai-4.2.0",
        "regenerator-runtime": "libs/regenerator-runtime/runtime",
        "vz-console": "jet-composites/vz-console",
      },

    config: {
      ojL10n: {
        merge: {
          "ojtranslations/nls/ojtranslations":
            "vz-console/utils/resources/nls/strings",
        },
      },
    },
    // endinjector
  });
}());

require(["ojs/ojbootstrap", "js-yaml", "root"], function (
  Bootstrap,
  JsYaml,
  Root
) {
  // this callback gets executed when all required modules are loaded
  Bootstrap.whenDocumentReady().then(function () {
    Root.init();
  });
});
