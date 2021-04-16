// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

const path = require("path");
const express = require("express");

const port = 8000;
const app = express();
const staticPath = path.join(__dirname, "web");
const apiUrl = process.env.VZ_API_URL;
if (!apiUrl) {
  throw new Error("VZ_API_URL not specified. Aborting..");
}

/**
 * Uses environment variables specified at build time to generate an env.js file in the Javascript output directory
 * The env.js file is sourced by index.html to make those values available to the application at runtime.
 */
function createEnvJs() {
  const fs = require("fs");
  const envJsFilePath = path.join(staticPath, "js/env.js");
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
      }"; var vzApiUrl = "${apiUrl}"; var vzApiVersion = "${
        process.env.VZ_API_VERSION || ""
      }"`,
      { flag: "wx" }
    );
    console.log(`${envJsFilePath} created.`);
  } catch (e) {
    console.log(`Failed creating ${envJsFilePath}: ${e}`);
    throw e;
  }
}

createEnvJs();
app.use(express.static(staticPath));

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
  res.redirect(
    `/?ojr=instance&selectedItem=projects`
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
  res.redirect(
    `/?ojr=project&projectId=${req.params.id}`
  );
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

app.listen(port, "0.0.0.0", function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info(
    "==>Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.",
    port,
    port
  );
});
