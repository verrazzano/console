// Copyright (C) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { KialiMainPage } from "../pageObjects/kiali/KialiMainPage.pom";
import { KialiHeaderBar } from "../pageObjects/kiali/KialiHeaderBar.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

xdescribe("Kiali Home Page", async () => {
  let kialiMainPage: KialiMainPage;
  let kialiHeaderBar: KialiHeaderBar;

  before(async () => {
    await Utils.navigateAndLogin();
    kialiMainPage = new KialiMainPage();
    kialiHeaderBar = new KialiHeaderBar();
    await Utils.gotoKialiMainPage();
  });

  describe("Access Kiali header", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await kialiMainPage.waitForHeader()).to.be.true;
    });

    it("Main Page should contain sidebar", async () => {
      expect(await kialiMainPage.waitForSidemenu()).to.be.true;
    });
  });

  describe("Access Kiali header logo", (): void => {
    it("Wait for sidebar", async () => {
      await kialiMainPage.waitForSidemenu();
    });

    it("Select logo", async () => {
      expect(await kialiHeaderBar.selectLogo()).to.be.true;
    });
  });

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      await Utils.saveFailedTestInfo("Kiali", this.currentTest.title);
    }
  });

  after(async () => {
    await Utils.releaseDriver();
  });
});
