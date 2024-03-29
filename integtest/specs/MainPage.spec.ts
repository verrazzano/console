// Copyright (C) 2020, 2023, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { KeycloakLoginPage } from "../pageObjects/keycloak/KeycloakLoginPage.pom";
import { ConsoleMainPage } from "../pageObjects/console/ConsoleMainPage.pom";
import { ConsoleHeaderBar } from "../pageObjects/console/ConsoleHeaderBar.pom";
import { GrafanaMainPage } from "../pageObjects/grafana/GrafanaMainPage.pom";
import { KialiMainPage } from "../pageObjects/kiali/KialiMainPage.pom";
import { PrometheusMainPage } from "../pageObjects/prometheus/PrometheusMainPage.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";
import { Actions } from "../utils/Actions";
import { OSDMainPage } from "../pageObjects/osd/OSDMainPage.pom";
import { JaegerMainPage } from "../pageObjects/jaeger/JaegerMainPage.pom";
import { ThanosQueryMainPage } from "../pageObjects/thanos/ThanosQueryMainPage.pom";
import { ThanosRulerMainPage } from "../pageObjects/thanos/ThanosRulerMainPage.pom";
import { AlertmanagerMainPage } from "../pageObjects/alertmanager/AlertmanagerMainPage.pom";

describe("UI Tests for Home Pages (Console, Grafana, OSD, Prometheus, Thanos, Kiali, Jaeger, Alertmanager)", (): void => {
  let consoleMainPage: ConsoleMainPage;
  let consoleHeaderBar: ConsoleHeaderBar;
  let tabIndex = 1;

  before(async () => {
    await Utils.navigateAndLogin();
    consoleMainPage = new ConsoleMainPage();
    consoleHeaderBar = new ConsoleHeaderBar();
    await Utils.gotoConsoleMainPage();
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
      await consoleMainPage.navigateToVMI("grafana", tabIndex++);
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

  describe("Navigate to OSD home page", (): void => {
    it("Wait for navigation to OSD", async () => {
      await consoleMainPage.navigateToVMI("osd", tabIndex++);
    });

    describe("OSD Home Page", (): void => {
      it("Wait for OSD home page to be ready", async () => {
        const osdMainPage = new OSDMainPage();
        expect(await osdMainPage.isPageLoaded()).to.be.true;
      });
    });

    after(async () => {
      // Switch back to Console
      await Actions.switchToTab(0);
    });
  });

  describe("Navigate to Prometheus home page", (): void => {
    it("Wait for navigation to Prometheus", async () => {
      await consoleMainPage.navigateToVMI("prometheus", tabIndex++);
    });

    describe("Prometheus Home Page", (): void => {
      it("Wait for Prometheus home page to be ready", async () => {
        const prometheusMainPage = new PrometheusMainPage();
        expect(await prometheusMainPage.isPageLoaded()).to.be.true;
      });
    });

    after(async () => {
      // Switch back to Console
      await Actions.switchToTab(0);
    });
  });

  describe("Navigate to Kiali home page", (): void => {
    it("Wait for navigation to Kiali", async () => {
      await consoleMainPage.navigateToVMI("kiali", tabIndex++);
    });

    describe("Kiali Home Page", (): void => {
      it("Wait for Kiali home page to be ready", async () => {
        const kialiHomePage = new KialiMainPage();
        expect(await kialiHomePage.isPageLoaded()).to.be.true;
      });
    });

    after(async () => {
      // Switch back to Console
      await Actions.switchToTab(0);
    });
  });

  describe("Navigate to Jaeger home page", (): void => {
    if (!Utils.isComponentEnabledInTestConfig("jaeger")) {
      console.log(
        "Jaeger is not enabled in test configuration, skipping Jaeger tests in MainPage test spec"
      );
      return;
    }
    it("Wait for navigation to Jaeger", async () => {
      await consoleMainPage.navigateToVMI("jaeger", tabIndex++);
    });

    xdescribe("Jaeger Home Page", (): void => {
      it("Wait for Jaeger home page to be ready", async () => {
        const jaegerHomePage = new JaegerMainPage();
        expect(await jaegerHomePage.isPageLoaded()).to.be.true;
      });
    });

    after(async () => {
      // Switch back to Console
      await Actions.switchToTab(0);
    });
  });

  describe("Navigate to Thanos Query home page", (): void => {
    if (!Utils.isComponentEnabledInTestConfig("thanosquery")) {
      console.log(
        "Thanos Query is not enabled in test configuration, skipping Thanos Query tests in MainPage test spec"
      );
      return;
    }
    it("Wait for navigation to Thanos Query", async () => {
      await consoleMainPage.navigateToVMI("thanosquery", tabIndex++);
    });

    describe("Thanos Home Page", (): void => {
      it("Wait for Thanos home page to be ready", async () => {
        const thanosQueryMainPage = new ThanosQueryMainPage();
        expect(await thanosQueryMainPage.isPageLoaded()).to.be.true;
      });
    });

    after(async () => {
      // Switch back to Console
      await Actions.switchToTab(0);
    });
  });

  describe("Navigate to Thanos Ruler home page", (): void => {
    if (!Utils.isComponentEnabledInTestConfig("thanosruler")) {
      console.log(
        "Thanos Ruler is not enabled in test configuration, skipping Thanos Ruler tests in MainPage test spec"
      );
      return;
    }
    it("Wait for navigation to Thanos Ruler", async () => {
      await consoleMainPage.navigateToVMI("thanosruler", tabIndex++);
    });

    describe("Thanos Ruler Home Page", (): void => {
      it("Wait for Thanos Ruler home page to be ready", async () => {
        const thanosRulerMainPage = new ThanosRulerMainPage();
        expect(await thanosRulerMainPage.isPageLoaded()).to.be.true;
      });
    });

    after(async () => {
      // Switch back to Console
      await Actions.switchToTab(0);
    });
  });

  describe("Navigate to Alertmanager home page", (): void => {
    if (!Utils.isComponentEnabledInTestConfig("alertmanager")) {
      console.log(
        "Alertmanager is not enabled in test configuration, skipping Alertmanager tests in MainPage test spec"
      );
      return;
    }
    it("Wait for navigation to Alertmanager", async () => {
      await consoleMainPage.navigateToVMI("alertmanager", tabIndex++);
    });

    describe("Alertmanager Home Page", (): void => {
      it("Wait for Alertmanager home page to be ready", async () => {
        const alertmanagerMainPage = new AlertmanagerMainPage();
        expect(await alertmanagerMainPage.isPageLoaded()).to.be.true;
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
      const keycloakLoginPage = new KeycloakLoginPage();
      expect(await keycloakLoginPage.isPageLoaded()).to.be.true;
    });
  });

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      await Utils.saveFailedTestInfo("MainPage", this.currentTest.title);
    }
  });

  after(async () => {
    await Utils.releaseDriver();
  });
});
