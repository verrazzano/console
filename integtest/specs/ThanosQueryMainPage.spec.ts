// Copyright (C) 2023, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { expect } from "chai";
import { Utils } from "../utils/Utils";
import { ThanosQueryMainPage } from "../pageObjects/thanos/ThanosQueryMainPage.pom";
import { ThanosQueryHeaderBar } from "../pageObjects/thanos/ThanosQueryHeaderBar.pom";

describe("Thanos Query Home Page", (): void => {
  let thanosQueryMainPage: ThanosQueryMainPage;
  let thanosQueryHeaderBar: ThanosQueryHeaderBar;

  if (!Utils.isComponentEnabledInTestConfig("thanosquery")) {
    console.log("Thanos Query is not enabled in test config, skipping these tests");
    return;
  }
  before(async () => {
    await Utils.navigateAndLogin();
    thanosQueryMainPage = new ThanosQueryMainPage();
    thanosQueryHeaderBar = new ThanosQueryHeaderBar();
    await Utils.gotoThanosQueryMainPage();
  });

  describe("Access Thanos Query header", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await thanosQueryMainPage.waitForHeader()).to.be.true;
    });

    it("Main Page should contain Thanos Query panel", async () => {
      expect(await thanosQueryMainPage.waitForThanosQueryPanel()).to.be.true;
    });

    it("Main Page should contain add panel button", async () => {
      expect(await thanosQueryMainPage.waitForAddPanelButton()).to.be.true;
    });
  });

  describe("Access Thanos Query header bar and logo", (): void => {
    it("Wait for header", async () => {
      await thanosQueryMainPage.waitForHeader();
    });

    it("Select logo", async () => {
      expect(await thanosQueryHeaderBar.selectLogo()).to.be.true;
    });
  });

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      await Utils.saveFailedTestInfo("Thanos", this.currentTest.title);
    }
  });

  after(async () => {
    await Utils.releaseDriver();
  });
});
