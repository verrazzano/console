// Copyright (C) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { KibanaMainPage } from "../pageObjects/kibana/KibanaMainPage.pom";
import { expect } from "chai";
import { Utils } from "../utils/Utils";

describe("Kibana Home Page", async () => {
  let kibanaMainPage: KibanaMainPage;

  before(async () => {
    await Utils.navigateAndLogin();
    kibanaMainPage = new KibanaMainPage();
    await Utils.gotoKibanaMainPage();
  });

  describe("Access Kibana header", (): void => {
    it("Main Page should load and contain header", async () => {
      expect(await kibanaMainPage.waitForHeader()).to.be.true;
    });

  });

  afterEach(async function () {
    if (this.currentTest.state === "failed") {
      const titleNoSpaces = this.currentTest.title.split(" ").join("_");
      await Utils.takeScreenshot(`Screenshot_${titleNoSpaces}.png`);
    }
  });

  after(async () => {
    await Utils.releaseDriver();
  });
});
