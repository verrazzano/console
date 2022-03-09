// Copyright (C) 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { KeycloakLoginPage } from "../pageObjects/keycloak/KeycloakLoginPage.pom";
import { ErrorPage502 } from "../pageObjects/error/ErrorPage502.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

describe("UI Negative Tests for Console Home Page", (): void => {
  describe("Keycloak login with invalid credentials", (): void => {
    let keycloakLoginPage: KeycloakLoginPage;

    before("Wait for Keycloak login page to load", async () => {
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

  describe("Access OSD without login", (): void => {
    let keycloakLoginPage: KeycloakLoginPage;

    before("Navigate to OSD main page", async () => {
      keycloakLoginPage = new KeycloakLoginPage();
      await Utils.gotoOSDMainPage();
    });

    it("Wait for Keycloak login page to load", async () => {
      await keycloakLoginPage.isPageLoaded();
    });
  });

  describe("Access Grafana without login", (): void => {
    let keycloakLoginPage: KeycloakLoginPage;

    before("Navigate to Grafana main page", async () => {
      keycloakLoginPage = new KeycloakLoginPage();
      await Utils.gotoGrafanaMainPage();
    });

    it("Wait for Keycloak login page to load", async () => {
      await keycloakLoginPage.isPageLoaded();
    });
  });

  describe("Access Prometheus without login", (): void => {
    let keycloakLoginPage: KeycloakLoginPage;

    before("Navigate to Prometheus main page", async () => {
      keycloakLoginPage = new KeycloakLoginPage();
      await Utils.gotoPrometheusMainPage();
    });

    it("Wait for Keycloak login page to load", async () => {
      await keycloakLoginPage.isPageLoaded();
    });
  });

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      const titleNoSpaces = this.currentTest.title.split(" ").join("_");
      await Utils.takeScreenshot(`Screenshot_${titleNoSpaces}.png`);
    }
  });

  after(async () => {
    await Utils.releaseDriver();
  });
});
