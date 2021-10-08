// Copyright (C) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { GrafanaMainPage } from "../pageObjects/grafana/GrafanaMainPage.pom";
import { GrafanaSideBar } from "../pageObjects/grafana/GrafanaSideBar.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

describe("Grafana Home Page", (): void => {
  let grafanaMainPage: GrafanaMainPage;
  let grafanaSideBar: GrafanaSideBar;

  before(async () => {
    await Utils.navigateAndLogin();
    grafanaMainPage = new GrafanaMainPage();
    grafanaSideBar = new GrafanaSideBar();
    await Utils.gotoGrafanaMainPage();
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

  after(async () => {
    await Utils.releaseDriver();
  });
});
