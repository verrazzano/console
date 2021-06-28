// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
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
      }"; var vzApiUrl = "${
        process.env.VZ_API_URL || ""
      }"; var vzWLSImagesEnabled = ${process.env.VZ_WLS_IMAGES || false};`,
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
  app.get("/oamapps", (req, res, next) => {
    res.redirect(
      `/?ojr=instance&selectedItem=oamapps${
        req.query.cluster ? "&cluster=" + req.query.cluster : ""
      }`
    );
  });
  app.get("/oamcomps", (req, res, next) => {
    res.redirect(
      `/?ojr=instance&selectedItem=oamcomps${
        req.query.cluster ? "&cluster=" + req.query.cluster : ""
      }`
    );
  });
  app.get("/projects", (req, res, next) => {
    res.redirect(`/?ojr=instance&selectedItem=projects`);
  });
  app.get("/weblogicimages", (req, res, next) => {
    res.redirect(
      `/?ojr=instance&selectedItem=weblogicimages${
        req.query.cluster ? "&cluster=" + req.query.cluster : ""
      }`
    );
  });
  app.get("/oamapps/:id", (req, res, next) => {
    res.redirect(
      `/?ojr=oamapp&oamAppId=${req.params.id}${
        req.query.cluster ? "&cluster=" + req.query.cluster : ""
      }`
    );
  });
  app.get("/oamcomps/:id", (req, res, next) => {
    res.redirect(
      `/?ojr=oamcomp&oamCompId=${req.params.id}${
        req.query.cluster ? "&cluster=" + req.query.cluster : ""
      }`
    );
  });
  app.get("/projects/:id", (req, res, next) => {
    res.redirect(`/?ojr=project&projectId=${req.params.id}`);
  });
  app.get("/oamapps/:id/components", (req, res, next) => {
    res.redirect(
      `/?ojr=oamapp&oamAppId=${req.params.id}&selectedItem=components${
        req.query.cluster ? "&cluster=" + req.query.cluster : ""
      }`
    );
  });
  app.get("/oamapps/:id/components/:selectedComponent", (req, res, next) => {
    res.redirect(
      `/?ojr=oamapp&oamAppId=${
        req.params.id
      }&selectedItem=components&selectedComponent=${
        req.params.selectedComponent
      }${req.query.cluster ? "&cluster=" + req.query.cluster : ""}`
    );
  });
  app.get(
    "/oamapps/:id/components/:selectedComponent/:selectedItem",
    (req, res, next) => {
      res.redirect(
        `/?ojr=oamapp&oamAppId=${req.params.id}&selectedItem=${
          req.params.selectedItem
        }&selectedComponent=${req.params.selectedComponent}${
          req.query.cluster ? "&cluster=" + req.query.cluster : ""
        }`
      );
    }
  );
  app.get("/oamcomps/:id/:selectedItem", (req, res, next) => {
    res.redirect(
      `/?ojr=oamcomp&oamCompId=${req.params.id}&selectedItem=${
        req.params.selectedItem
      }${req.query.cluster ? "&cluster=" + req.query.cluster : ""}`
    );
  });
  app.get("/clusters", (req, res, next) => {
    res.redirect("/?ojr=instance&selectedItem=clusters");
  });

  app.get("/projects/:id/namespaces", (req, res, next) => {
    res.redirect(
      `/?ojr=project&projectId=${req.params.id}&selectedItem=namespaces`
    );
  });
  app.get("/projects/:id/clusters", (req, res, next) => {
    res.redirect(
      `/?ojr=project&projectId=${req.params.id}&selectedItem=clusters`
    );
  });
  app.get("/projects/:id/security", (req, res, next) => {
    res.redirect(
      `/?ojr=project&projectId=${req.params.id}&selectedItem=security`
    );
  });
  app.get("/projects/:id/networkPolicies", (req, res, next) => {
    res.redirect(
      `/?ojr=project&projectId=${req.params.id}&selectedItem=networkPolicies`
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
