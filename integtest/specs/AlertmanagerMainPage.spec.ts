// Copyright (C) 2023, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { AlertmanagerMainPage } from "../pageObjects/alertmanager/AlertmanagerMainPage.pom";
import { AlertmanagerHeaderBar } from "../pageObjects/alertmanager/AlertmanagerHeaderBar.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

describe("Alertmanager Home Page", async () => {
  if (!Utils.isComponentEnabledInTestConfig("alertmanager")) {
    console.log(
      "Alertmanager is not enabled in test configuration, skipping Alertmanager tests"
    );
    return;
  }

  let alertmanagerMainPage: AlertmanagerMainPage;
  let alertmanagerHeaderBar: AlertmanagerHeaderBar;

  before(async () => {
    await Utils.navigateAndLogin();
    alertmanagerMainPage = new AlertmanagerMainPage();
    alertmanagerHeaderBar = new AlertmanagerHeaderBar();
    await Utils.gotoAlertmanagerMainPage();
  });

  describe("Access Alertmanager navigation bar", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await alertmanagerMainPage.waitForHeader()).to.be.true;
    });
  });

  describe("Access Alertmanager navigation links", (): void => {
    it("Wait for Alerts view", async () => {
      await alertmanagerHeaderBar.clickAlertsLink();
      await alertmanagerMainPage.waitForAlertsView();
    });

    it("Wait for Silences view", async () => {
      await alertmanagerHeaderBar.clickSilencesLink();
      await alertmanagerMainPage.waitForSilencesView();
    });

    it("Wait for Status view", async () => {
      await alertmanagerHeaderBar.clickStatusLink();
      await alertmanagerMainPage.waitForStatusView();
    });

    it("Wait for Settings view", async () => {
      await alertmanagerHeaderBar.clickSettingsLink();
      await alertmanagerMainPage.waitForSettingsView();
    });
  });

  afterEach(async function () {
    if (this?.currentTest?.state === "failed") {
      await Utils.saveFailedTestInfo("Alertmanager", this.currentTest.title);
    }
  });

  after(async () => {
    await Utils.releaseDriver();
  });
});
