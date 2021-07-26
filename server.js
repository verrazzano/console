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
 * env.js is generated before we get here so we can form an integrity hash and add that into index.html
 */
function addEnvJs() {
  const fs = require("fs");
  const envJsFilePath = path.join(staticPath, "js/env.js");
  console.log(`${envJsFilePath} joined.`);
}

addEnvJs();
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

app.get("/clusters", (req, res, next) => {
  res.redirect("/?ojr=instance&selectedItem=clusters");
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
