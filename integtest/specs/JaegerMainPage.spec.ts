// Copyright (C) 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { JaegerMainPage } from "../pageObjects/jaeger/JaegerMainPage.pom";
import { JaegerHeaderBar } from "../pageObjects/jaeger/JaegerHeaderBar.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

xdescribe("Jaeger Home Page", async () => {
  let jaegerMainPage: JaegerMainPage;
  let jaegerHeaderBar: JaegerHeaderBar;

  before(async () => {
    await Utils.navigateAndLogin();
    jaegerMainPage = new JaegerMainPage();
    jaegerHeaderBar = new JaegerHeaderBar();
    await Utils.gotoJaegerMainPage();
  });

  describe("Access Jaeger navigation bar", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await jaegerMainPage.waitForHeader()).to.be.true;
    });

    it("Main Page should contain sidebar", async () => {
      expect(await jaegerMainPage.waitForHeader()).to.be.true;
    });
  });

  describe("Access Jaeger should have search bar and column", (): void => {
    it("Wait for searc side bar", async () => {
      await jaegerHeaderBar.waitForSearchSidebar();
    });

    it("Wait for search side column", async () => {
      await jaegerHeaderBar.waitForSearchColumn();
    });

    it("Click trace diff and wait for trace diff selectors", async () => {
      await jaegerHeaderBar.clickCompareTracesTab()
      await jaegerHeaderBar.waitForTraceDiffSelector();
    });

    it("Click system architecture tab and wait for architecture contents", async () => {
      await jaegerHeaderBar.clickArchitectureTab()
      await jaegerHeaderBar.waitForArchitectureContent();
    });

  });

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      await Utils.saveFailedTestInfo("Jaeger", this.currentTest.title);
    }
  });

  after(async () => {
    await Utils.releaseDriver();
  });
});
