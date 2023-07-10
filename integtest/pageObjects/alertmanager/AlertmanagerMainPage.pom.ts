// Copyright (C) 2023, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for Alertymanager main page
 */
export class AlertmanagerMainPage {
  private static readonly FILTER_MATCHER: By = By.xpath(
    `//input[@id="filter-bar-matcher"]`
  );

  private static readonly ALERTS_MAIN_PAGE_EXPAND_BUTTON: By = By.className(
    "fa-plus"
  );

  private static readonly SILENCES_ACTIVE_TAB: By = By.xpath(
    `//ul/li/span[contains(text(),"Active")]`
  );

  private static readonly STATUS_HEADER_TEXT: By = By.xpath(
    `//div/h1[contains(text(),"Status")]`
  );

  private static readonly SETTINGS_RADIO_BUTTON: By = By.className(
    `custom-radio`
  );

  protected pageUrl: string = "/";
  protected pageLoadedElement: By = AlertmanagerMainPage.FILTER_MATCHER;

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    try {
      await Wait.waitForPresent(AlertmanagerMainPage.FILTER_MATCHER);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for Alerts view */
  public async waitForAlertsView(): Promise<boolean> {
    try {
      await Wait.waitForPresent(
        AlertmanagerMainPage.ALERTS_MAIN_PAGE_EXPAND_BUTTON
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for Silences view */
  public async waitForSilencesView(): Promise<boolean> {
    try {
      await Wait.waitForPresent(AlertmanagerMainPage.SILENCES_ACTIVE_TAB);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for Status view */
  public async waitForStatusView(): Promise<boolean> {
    try {
      await Wait.waitForPresent(AlertmanagerMainPage.STATUS_HEADER_TEXT);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for Settings view */
  public async waitForSettingsView(): Promise<boolean> {
    try {
      await Wait.waitForPresent(AlertmanagerMainPage.SETTINGS_RADIO_BUTTON);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
