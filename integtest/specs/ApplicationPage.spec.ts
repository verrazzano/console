// Copyright (C) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { expect } from "chai";
import { Utils } from "../utils/Utils";
import { ApplicationPage } from "../pageObjects/console/ApplicationPage.pom";
import { By } from "selenium-webdriver";
import { Actions } from "../utils/Actions";

describe("Application Details Page", (): void => {
  let appPage: ApplicationPage;
  const appConfig = Utils.getConfig("app");

  before(async () => {
    await Utils.navigateAndLogin();
    if (!appConfig || !appConfig.name) {
      throw new Error(
        "No app name specified, cannot run application details page test"
      );
    }
    console.log(`Testing application details for app ${appConfig.name}`);
    const linkBy = By.linkText(appConfig.name);
    // await Actions.scrollIntoView(linkBy);
    // await Actions.doClick(linkBy);
    try {
      await Actions.doClick(linkBy);
    } catch (error) {
      await Utils.saveFailedTestInfo("AppPage", "before");
      throw error;
    }
    appPage = new ApplicationPage();
  });

  describe("App page loads", (): void => {
    it("Application Page should load", async () => {
      expect(await appPage.isPageLoaded()).to.be.true;
    });

    it("App Page has app info", async () => {
      expect(await appPage.waitForApplicationInfo()).to.be.true;
    });

    it("App Page has NO error box", async () => {
      expect(await appPage.errorComponentExists()).to.be.false;
    });

    it("App info is as expected", async () => {
      expect(await appPage.getAppNameItem()).to.contain(appConfig.name);
      expect(await appPage.getAppNamespaceItem()).to.contain(
        appConfig.namespace
      );
      if (appConfig.cluster) {
        expect(await appPage.getAppClusterItem()).to.contain(appConfig.cluster);
      }
    });

    it("Has expected app components", async () => {
      if (appConfig.components) {
        for (const compName of appConfig.components) {
          console.log(`looking for component ${compName}`);
          expect(await appPage.componentExistsOnPage(compName)).to.be.true;
        }
      }
    });
  });

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      await Utils.saveFailedTestInfo("AppPage", this.currentTest.title);
    }
  });

  after(() => {
    Utils.releaseDriver();
  });
});
