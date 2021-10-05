// Copyright (C) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { KeycloakLoginPage } from "../pageObjects/keycloak/KeycloakLoginPage.pom";
import { ErrorPage502 } from "../pageObjects/error/ErrorPage502.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

describe("UI Negative Tests for Console Home Page", (): void => {
  describe("Keycloak login with invalid credentials", (): void => {
    let keycloakLoginPage: KeycloakLoginPage;

    before("Wait for keycloak login page to load", async () => {
      keycloakLoginPage = new KeycloakLoginPage();
      const useInvalidLoginInfo = true;
      await Utils.navigateAndLogin(useInvalidLoginInfo);
      await keycloakLoginPage.isPageLoaded();
    });

    it("Login screen should contain username box", async () => {
      expect(await keycloakLoginPage.waitForUsernameBox()).to.be.true;
    });

    it("Login screen should contain invalid credentials error", async () => {
      expect(await keycloakLoginPage.waitForInvalidCredentialsError()).to.be
        .true;
    });
  });

  describe("Access an invalid url after loggin in", (): void => {
    let errorPage502: ErrorPage502;

    before(async () => {
      await Utils.navigateAndLogin();
    });

    it("Navigate to an invalid URL", async () => {
      expect(await Utils.gotoInvalidUrl()).to.be.true;
    });

    it("Wait for HTTP 502 header", async () => {
      errorPage502 = new ErrorPage502();
      expect(await errorPage502.waitForHeader()).to.be.true;
    });
  });

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      const titleNoSpaces = this.currentTest.title.split(" ").join("_");
      await Utils.takeScreenshot(`Screenshot_${titleNoSpaces}.png`);
    }
  });

  after(() => {
    Utils.releaseDriver();
  });
});
