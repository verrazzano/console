// Copyright (C) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { KeycloakLoginPage } from "../pageObjects/keycloak/KeycloakLoginPage.pom";
import { ConsoleMainPage } from "../pageObjects/console/ConsoleMainPage.pom";
import { ConsoleHeaderBar } from "../pageObjects/console/ConsoleHeaderBar.pom";
import { GrafanaMainPage } from "../pageObjects/grafana/GrafanaMainPage.pom";
import { KibanaMainPage } from "../pageObjects/kibana/KibanaMainPage.pom";
import { PrometheusMainPage } from "../pageObjects/prometheus/PrometheusMainPage.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";
import { Actions } from "../utils/Actions";

describe("UI Tests for Home Pages (Console, Grafana, Kibana, Prometheus)", (): void => {
  let consoleMainPage: ConsoleMainPage;
  let consoleHeaderBar: ConsoleHeaderBar;

  before(async () => {
    await Utils.navigateAndLogin();
    consoleHeaderBar = new ConsoleHeaderBar();
    consoleMainPage = await Utils.gotoConsoleMainPage();
  });

  describe("Access Console header and footer", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await consoleMainPage.waitForHeader()).to.be.true;
    });

    it("Main Page should contain footer", async () => {
      expect(await consoleMainPage.waitForFooter()).to.be.true;
    });

    it("Main Page should contain instance information", async () => {
      expect(await consoleMainPage.waitForInstanceInfo()).to.be.true;
    });

    it("Main Page should NOT contain error box", async () => {
      expect(await consoleMainPage.errorComponentExists()).to.be.false;
    });
  });

  describe("Access Console header logo", (): void => {
    it("Wait for header", async () => {
      await consoleMainPage.waitForHeader();
    });

    it("Access header logo", async () => {
      expect(await consoleHeaderBar.selectLogo()).to.be.true;
    });
  });

  describe("Navigate to Grafana home page", (): void => {
    it("Wait for navigation to Grafana", async () => {
      await consoleMainPage.navigateToVMI("grafana", 1);
    });

    describe("Grafana Home Page", (): void => {
      it("Wait for Grafana home page to be ready", async () => {
        const grafanaMainPage = new GrafanaMainPage();
        expect(await grafanaMainPage.isPageLoaded()).to.be.true;
      });
    });

    after(async () => {
      // Switch back to Console
      await Actions.switchToTab(0);
    });
  });

  describe("Navigate to Kibana home page", (): void => {
    it("Wait for navigation to Kibana", async () => {
      await consoleMainPage.navigateToVMI("kibana", 2);
    });

    describe("Kibana Home Page", (): void => {
      it("Wait for Kibana home page to be ready", async () => {
        let kibanaMainPage = new KibanaMainPage();
        expect(await kibanaMainPage.isPageLoaded()).to.be.true;
      });
    });

    after(async () => {
      // Switch back to Console
      await Actions.switchToTab(0);
    });
  });

  describe("Navigate to Prometheus home page", (): void => {
    it("Wait for navigation to Prometheus", async () => {
      await consoleMainPage.navigateToVMI("prometheus", 3);
    });

    describe("Prometheus Home Page", (): void => {
      it("Wait for Prometheus home page to be ready", async () => {
        let prometheusMainPage = new PrometheusMainPage();
        expect(await prometheusMainPage.isPageLoaded()).to.be.true;
      });
    });

    after(async () => {
      // Switch back to Console
      await Actions.switchToTab(0);
    });
  });

  describe("Signout from the console", (): void => {
    it("Click on sign-out button", async () => {
      expect(await consoleHeaderBar.clickSignOut()).to.be.true;
    });

    it("Wait for Keycloak login page to be ready", async () => {
      let keycloakLoginPage = new KeycloakLoginPage();
      expect(await keycloakLoginPage.isPageLoaded()).to.be.true;
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
