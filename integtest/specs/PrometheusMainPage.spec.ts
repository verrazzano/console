// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { PrometheusMainPage } from "../pageObjects/prometheus/PrometheusMainPage.pom";
import { PrometheusHeaderBar } from "../pageObjects/prometheus/PrometheusHeaderBar.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

describe("Prometheus Home Page", (): void => {
  let prometheusMainPage: PrometheusMainPage;
  let prometheusSideBar: PrometheusHeaderBar;

  before(async () => {
    await Utils.navigateAndLogin();
    prometheusSideBar = new PrometheusHeaderBar();
    prometheusMainPage = await Utils.gotoPrometheusMainPage();
  });

  describe("Access Prometheus header", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await prometheusMainPage.waitForHeader()).to.be.true;
    });

    it("Main Page should contain prometheus panel", async () => {
      expect(await prometheusMainPage.waitForPrometheusPanel()).to.be.true;
    });

    it("Main Page should contain add graph button", async () => {
      expect(await prometheusMainPage.waitForAddGraphButton()).to.be.true;
    });
  });

  describe("Access Prometheus header bar logo", (): void => {
    it("Wait for header", async () => {
      await prometheusMainPage.waitForHeader();
    });

    it("Select logo", async () => {
      expect(await prometheusSideBar.selectLogo()).to.be.true;
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
