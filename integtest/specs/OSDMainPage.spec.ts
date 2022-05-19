// Copyright (C) 2021, 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { OSDMainPage } from "../pageObjects/osd/OSDMainPage.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

describe("OSD Home Page", async () => {
  let osdMainPage: OSDMainPage;

  before(async () => {
    await Utils.navigateAndLogin();
    osdMainPage = new OSDMainPage();
    await Utils.gotoOSDMainPage();
  });

  describe("Access OSD Page", (): void => {
    it("Main Page should load contain body", async () => {
      expect(await osdMainPage.waitForPageLoad()).to.be.true;
    });
  });

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      await Utils.saveFailedTestInfo("OSD", this.currentTest.title);
    }
  });

  after(async () => {
    await Utils.releaseDriver();
  });
});
