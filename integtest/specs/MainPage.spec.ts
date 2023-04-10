// Copyright (C) 2020, 2022, Oracle and/or its affiliates.
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

describe("UI Tests for Home Pages (Console, Grafana, OSD, Prometheus, Thanos, Kiali, Jaeger)", (): void => {
  let consoleMainPage: ConsoleMainPage;
  let consoleHeaderBar: ConsoleHeaderBar;

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

  describe("Navigate to OSD home page", (): void => {
    it("Wait for navigation to OSD", async () => {
      await consoleMainPage.navigateToVMI("osd", 2);
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
      await consoleMainPage.navigateToVMI("prometheus", 3);
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

  // if (Utils.shouldTestThanos()) {
    describe("Navigate to Thanos Query home page", (): void => {
      it("Wait for navigation to Thanos Query", async () => {
        await consoleMainPage.navigateToVMI("thanosquery", 3);
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
  // }

  if (Utils.shouldTestKiali()) {
    describe("Navigate to Kiali home page", (): void => {
      it("Wait for navigation to Kiali", async () => {
        await consoleMainPage.navigateToVMI("kiali", 4);
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
  }

  if (Utils.shouldTestJaeger()) {
    xdescribe("Navigate to Jaeger home page", (): void => {
      it("Wait for navigation to Jaeger", async () => {
        await consoleMainPage.navigateToVMI("jaeger", 5);
      });

      describe("Jaeger Home Page", (): void => {
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
  }

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
