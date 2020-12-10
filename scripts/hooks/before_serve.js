// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"use strict";

/**
 * Uses environment variables specified at build time to generate an env.js file in the Javascript output directory
 * The env.js file is sourced by index.html to make those values available to the application at runtime.
 */
function createEnvJs() {
  const fs = require("fs");
  const envJsFilePath = "web/js/env.js";
  try {
    fs.unlinkSync(envJsFilePath);
    console.log(`Removed existing environment file ${envJsFilePath}`);
  } catch (e) {
    if (e.message.includes("ENOENT")) {
      console.log(`No existing ${envJsFilePath} found`);
    } else {
      console.log(`Error deleting existing ${envJsFilePath}: ${e}`);
      throw e;
    }
  }

  try {
    console.log("Creating env.js.");
    fs.writeFileSync(
      `${envJsFilePath}`,
      `var vzUiUrl = "${process.env.VZ_UI_URL}"; var vzKeycloakUrl = "${
        process.env.VZ_KEYCLOAK_URL
      }"; var vzAuth = "${process.env.VZ_AUTH || true}"; var vzClientId = "${
        process.env.VZ_CLIENT_ID
      }"; var vzApiUrl = "${process.env.VZ_API_URL || ""}"`,
      { flag: "wx" }
    );
    console.log(`${envJsFilePath} created.`);
  } catch (e) {
    console.log(`Failed creating ${envJsFilePath}: ${e}`);
    throw e;
  }
}

function rewriteUrls() {
  const express = require("express");
  const app = express();
  app.get("/models", (req, res, next) => {
    res.redirect(`/?ojr=instance&selectedItem=models`);
  });
  app.get("/bindings", (req, res, next) => {
    res.redirect(`/?ojr=instance&selectedItem=bindings`);
  });
  app.get("/oamapps", (req, res, next) => {
    res.redirect(`/?ojr=instance&selectedItem=oamapps`);
  });
  app.get("/oamcomps", (req, res, next) => {
    res.redirect(`/?ojr=instance&selectedItem=oamcomps`);
  });
  app.get("/models/:id", (req, res, next) => {
    res.redirect(`/?ojr=model&modelId=${req.params.id}`);
  });
  app.get("/bindings/:id", (req, res, next) => {
    res.redirect(`/?ojr=binding&bindingId=${req.params.id}`);
  });
  app.get("/oamapps/:id", (req, res, next) => {
    res.redirect(`/?ojr=oamapp&oamAppId=${req.params.id}`);
  });
  app.get("/oamcomps/:id", (req, res, next) => {
    res.redirect(`/?ojr=oamcomp&oamCompId=${req.params.id}`);
  });
  app.get("/models/:id/:selectedItem", (req, res, next) => {
    res.redirect(
      `/?ojr=model&modelId=${req.params.id}&selectedItem=${req.params.selectedItem}`
    );
  });
  app.get("/bindings/:id/:selectedItem", (req, res, next) => {
    res.redirect(
      `/?ojr=binding&bindingId=${req.params.id}&selectedItem=${req.params.selectedItem}`
    );
  });
  app.get("/oamapps/:id/components", (req, res, next) => {
    res.redirect(
      `/?ojr=oamapp&oamAppId=${req.params.id}&selectedItem=components`
    );
  });
  app.get("/oamapps/:id/components/:selectedComponent", (req, res, next) => {
    res.redirect(
      `/?ojr=oamapp&oamAppId=${req.params.id}&selectedItem=components&selectedComponent=${req.params.selectedComponent}`
    );
  });
  app.get(
    "/oamapps/:id/components/:selectedComponent/:selectedItem",
    (req, res, next) => {
      res.redirect(
        `/?ojr=oamapp&oamAppId=${req.params.id}&selectedItem=${req.params.selectedItem}&selectedComponent=${req.params.selectedComponent}`
      );
    }
  );
  app.get("/oamcomps/:id/:selectedItem", (req, res, next) => {
    res.redirect(
      `/?ojr=oamcomp&oamCompId=${req.params.id}&selectedItem=${req.params.selectedItem}`
    );
  });
  return app;
}

module.exports = function (configObj) {
  return new Promise((resolve, reject) => {
    console.log("Running before_serve hook.");
    createEnvJs();
    configObj.express = rewriteUrls();
    resolve(configObj);
  });
};
