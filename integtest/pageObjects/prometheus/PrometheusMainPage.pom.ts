// Copyright (C) 2021, 2023, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for Prometheus main page
 */
export class PrometheusMainPage {
  private static readonly HEADER_CONTAINER: By = By.className("navbar");

  private static readonly PROMETHEUS_PANEL: By = By.className("panel");

  private static readonly ADD_PANEL_BUTTON: By = By.xpath(
    "//button[contains(text(),'Add Panel')]"
  );

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    try {
      await Wait.waitForPresent(PrometheusMainPage.HEADER_CONTAINER);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for Prometheus panel */
  public async waitForPrometheusPanel(): Promise<boolean> {
    try {
      await Wait.waitForPresent(PrometheusMainPage.PROMETHEUS_PANEL);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for Add Panel button */
  public async waitForAddPanelButton(): Promise<boolean> {
    try {
      await Wait.waitForPresent(PrometheusMainPage.ADD_PANEL_BUTTON);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
