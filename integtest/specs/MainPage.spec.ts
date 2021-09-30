// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { ConsoleMainPage } from "../pageObjects/console/ConsoleMainPage.pom";
import { ConsoleHeaderBar } from "../pageObjects/console/ConsoleHeaderBar.pom";
import { GrafanaMainPage } from "../pageObjects/grafana/GrafanaMainPage.pom";
import { GrafanaSideBar } from "../pageObjects/grafana/GrafanaSideBar.pom";
import { KibanaMainPage } from "../pageObjects/kibana/KibanaMainPage.pom";
import { KibanaHeaderBar } from "../pageObjects/kibana/KibanaHeaderBar.pom";
import { PrometheusMainPage } from "../pageObjects/prometheus/PrometheusMainPage.pom";
import { PrometheusHeaderBar } from "../pageObjects/prometheus/PrometheusHeaderBar.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

describe("Combined tests for UI Pages (Console, Grafana, Kibana, Prometheus)", (): void => {
  let consoleMainPage: ConsoleMainPage;
  let consoleHeaderBar: ConsoleHeaderBar;

  before(async () => {
    const acceptCookies = true;
    await Utils.navigateAndLogin(acceptCookies);
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

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      const titleNoSpaces = this.currentTest.title.split(" ").join("_");
      await Utils.takeScreenshot(`Screenshot_${titleNoSpaces}.png`);
    }
  });
});

describe("Grafana Home Page", (): void => {
  let grafanaMainPage: GrafanaMainPage;
  let grafanaSideBar: GrafanaSideBar;

  before(async () => {
    grafanaSideBar = new GrafanaSideBar();
    grafanaMainPage = await Utils.gotoGrafanaMainPage();
  });

  describe("Access Grafana header", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await grafanaMainPage.waitForHeader()).to.be.true;
    });

    it("Main Page should contain sidebar", async () => {
      expect(await grafanaMainPage.waitForSidemenu()).to.be.true;
    });

    it("Main Page should contain grafana panel", async () => {
      expect(await grafanaMainPage.waitForGrafanaPanel()).to.be.true;
    });
  });

  describe("Access Grafana sidebar logo", (): void => {
    it("Wait for sidebar", async () => {
      await grafanaMainPage.waitForSidemenu();
    });

    it("Select logo", async () => {
      expect(await grafanaSideBar.selectLogo()).to.be.true;
    });
  });

  describe("Access Grafana user menu", (): void => {
    it("Wait for sidebar", async () => {
      await grafanaMainPage.waitForSidemenu();
    });

    it("Select user menu", async () => {
      expect(await grafanaSideBar.selectUserMenu()).to.be.true;
    });

    it("Select user menu content", async () => {
      expect(await grafanaSideBar.selectUserMenuContent()).to.be.true;
    });
  });

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      const titleNoSpaces = this.currentTest.title.split(" ").join("_");
      await Utils.takeScreenshot(`Screenshot_${titleNoSpaces}.png`);
    }
  });
});

describe("Kibana Home Page", (): void => {
  let kibanaMainPage: KibanaMainPage;
  let kibanaSideBar: KibanaHeaderBar;

  before(async () => {
    kibanaSideBar = new KibanaHeaderBar();
    kibanaMainPage = await Utils.gotoKibanaMainPage();
  });

  describe("Access Kibana header", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await kibanaMainPage.waitForHeader()).to.be.true;
    });

    it("Main Page should contain sidebar", async () => {
      expect(await kibanaMainPage.waitForSidemenu()).to.be.true;
    });
  });

  describe("Access Kibana sidebar logo", (): void => {
    it("Wait for sidebar", async () => {
      await kibanaMainPage.waitForSidemenu();
    });

    it("Select logo", async () => {
      expect(await kibanaSideBar.selectLogo()).to.be.true;
    });
  });

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      const titleNoSpaces = this.currentTest.title.split(" ").join("_");
      await Utils.takeScreenshot(`Screenshot_${titleNoSpaces}.png`);
    }
  });
});

describe("Prometheus Home Page", (): void => {
  let prometheusMainPage: PrometheusMainPage;
  let prometheusSideBar: PrometheusHeaderBar;

  before(async () => {
    prometheusSideBar = new PrometheusHeaderBar();
    prometheusMainPage = await Utils.gotoPrometheusMainPage();
  });

  describe("Access Prometheus header", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await prometheusMainPage.waitForHeader()).to.be.true;
    });

    it("Main Page should contain prometheus panel", async () => {
      expect(await prometheusMainPage.waitForPrometheusPanel()).to.be.true;
    });

    it("Main Page should contain add graph button", async () => {
      expect(await prometheusMainPage.waitForAddGraphButton()).to.be.true;
    });
  });

  describe("Access Prometheus header bar logo", (): void => {
    it("Wait for header", async () => {
      await prometheusMainPage.waitForHeader();
    });

    it("Select logo", async () => {
      expect(await prometheusSideBar.selectLogo()).to.be.true;
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