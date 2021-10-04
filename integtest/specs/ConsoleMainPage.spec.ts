// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { ConsoleMainPage } from "../pageObjects/console/ConsoleMainPage.pom";
import { ConsoleHeaderBar } from "../pageObjects/console/ConsoleHeaderBar.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

describe("Instance Details Page", (): void => {
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
