// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { MainPage } from "./pageObjects/MainPage.pom";
import { HeaderBar } from "./pageObjects/HeaderBar.pom";
import { expect } from "chai";
import { Utils } from "./utils/Utils";

describe("Instance Details Page", (): void => {
  let mainPage: MainPage;
  let headerBar: HeaderBar;

  before(async () => {
    let acceptCookies = true;
    await Utils.navigateAndLogin(acceptCookies);
    headerBar = new HeaderBar();
    mainPage = await Utils.gotoMainPage();
  });

  describe("Access Header and footer", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await mainPage.waitForHeader()).to.be.true;
    });

    it("Main Page should contain footer", async () => {
      expect(await mainPage.waitForFooter()).to.be.true;
    });

    it("Main Page should contain instance information", async () => {
      expect(await mainPage.waitForInstanceInfo()).to.be.true;
    });

    it("Main Page should NOT contain error box", async () => {
      expect(await mainPage.errorComponentExists()).to.be.false;
    });
  });

  describe("Access Header logo", (): void => {
    it("Wait for header", async () => {
      await mainPage.waitForHeader();
    });

    it("Access header logo", async () => {
      expect(await headerBar.selectLogo()).to.be.true;
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
