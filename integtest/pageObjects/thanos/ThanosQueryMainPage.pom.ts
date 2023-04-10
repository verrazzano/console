// Copyright (C) 2021, 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for Prometheus main page
 */
export class ThanosQueryMainPage {
  private static readonly HEADER_CONTAINER: By = By.className("navbar");

  private static readonly THANOS_QUERY_PANEL: By = By.className("panel");

  private static readonly ADD_PANEL_BUTTON: By = By.xpath(
    "//button[contains(text(),'Add Panel')]"
  );

  // Link to Classic UI
  private static readonly CLASSIC_UI_LINK = By.linkText("Classic UI");

  protected pageUrl: string = "/";
  protected pageLoadedElement: By = ThanosQueryMainPage.HEADER_CONTAINER;

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    try {
      await Wait.waitForPresent(ThanosQueryMainPage.HEADER_CONTAINER);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for Thanos Query panel */
  public async waitForThanosQueryPanel(): Promise<boolean> {
    try {
      await Wait.waitForPresent(ThanosQueryMainPage.THANOS_QUERY_PANEL);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for Add Panel button */
  public async waitForAddPanelButton(): Promise<boolean> {
    try {
      await Wait.waitForPresent(ThanosQueryMainPage.ADD_PANEL_BUTTON);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
