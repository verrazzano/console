// Copyright (C) 2023, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { expect } from "chai";
import { Utils } from "../utils/Utils";
import { ThanosRulerMainPage } from "../pageObjects/thanos/ThanosRulerMainPage.pom";
import { ThanosRulerHeaderBar } from "../pageObjects/thanos/ThanosRulerHeaderBar.pom";

describe("Thanos Ruler Home Page", (): void => {
  let thanosRulerMainPage: ThanosRulerMainPage;
  let thanosRulerHeaderBar: ThanosRulerHeaderBar;

  if (!Utils.isComponentEnabledInTestConfig("thanosruler")) {
    console.log(
      "Thanos Ruler is not enabled in test configuration, skipping the ThanosRulerMainPageSpec tests"
    );
    return;
  }
  before(async () => {
    await Utils.navigateAndLogin();
    thanosRulerMainPage = new ThanosRulerMainPage();
    thanosRulerHeaderBar = new ThanosRulerHeaderBar();
    await Utils.gotoThanosRulerMainPage();
  });

  describe("Access Thanos Ruler header", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await thanosRulerMainPage.waitForHeader()).to.be.true;
    });
  });

  describe("Access Thanos Ruler header bar and logo", (): void => {
    it("Wait for header", async () => {
      await thanosRulerMainPage.waitForHeader();
    });

    it("Select logo", async () => {
      expect(await thanosRulerHeaderBar.selectLogo()).to.be.true;
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
