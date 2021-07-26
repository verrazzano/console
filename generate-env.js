// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

const path = require("path");

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
      }"; var vzWLSImagesEnabled = ${
        process.env.VZ_WLS_IMAGES_ENABLED || false
      };`,
      { flag: "wx" }
    );
    console.log(`${envJsFilePath} created.`);
  } catch (e) {
    console.log(`Failed creating ${envJsFilePath}: ${e}`);
    throw e;
  }
}

createEnvJs();
