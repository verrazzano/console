// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { MainPage } from './pageObjects/MainPage.pom';
import { HeaderBar } from './pageObjects/HeaderBar.pom';
import {expect, assert} from 'chai';
import { Utils } from './utils/Utils';

describe("Instance Details Page", (): void => {
  let mainPage: MainPage;
  let headerBar: HeaderBar;

  before(async () => {
    await Utils.navigateAndLogin();
    headerBar = new HeaderBar();
    mainPage = await Utils.gotoMainPage();
  });

  describe(("Access Header and footer"), (): void => {

    it("Access Base Page should load", async () => {
      expect(await mainPage.isPageLoaded()).to.be.true;
    });

    it("Wait for header should not fail", async () => {
      await mainPage.waitForHeader();
    });

    it("Wait for footer should not fail", async () => {
      await mainPage.waitForFooter();
    });

  });

  describe(("Access Header logo"), (): void => {
    it("Access Base Page", async () => {
      expect(await mainPage.isPageLoaded()).to.be.true;
    });

    it("Wait for header", async () => {
      await mainPage.waitForHeader();
    });

    it("Access header logo", async () => {
      expect(await headerBar.selectLogo()).to.be.true;
    });

  });

  after(() => Utils.releaseDriver());
});
