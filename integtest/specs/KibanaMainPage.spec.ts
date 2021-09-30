// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { KibanaMainPage } from "../pageObjects/kibana/KibanaMainPage.pom";
import { KibanaHeaderBar } from "../pageObjects/kibana/KibanaHeaderBar.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

describe("Kibana Home Page", (): void => {
  let kibanaMainPage: KibanaMainPage;
  let kibanaSideBar: KibanaHeaderBar;

  before(async () => {
    const acceptCookies = true;
    await Utils.navigateAndLogin(acceptCookies);
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

  after(() => {
    Utils.releaseDriver();
  });
});