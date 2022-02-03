// Copyright (C) 2021, 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for Grafana main page
 */
export class GrafanaMainPage {
  // exists in v7.5.11 and v7.2.1
  private static readonly HEADER_CONTAINER: By = By.className("grafana-app");

  // exists in v7.5.11 and v7.2.1
  private static readonly SIDEMENU_CONTAINER: By = By.className("sidemenu");

  // exists in v7.5.11 and v7.2.1
  private static readonly DASHBOARD_CONTAINER: By = By.className(
    "dashboard-container"
  );

  protected pageUrl: string = "/";
  protected pageLoadedElement: By = GrafanaMainPage.HEADER_CONTAINER;

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    try {
      await Wait.waitForPresent(GrafanaMainPage.HEADER_CONTAINER);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for sidement */
  public async waitForSidemenu(): Promise<boolean> {
    try {
      await Wait.waitForPresent(GrafanaMainPage.SIDEMENU_CONTAINER);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for Grafana panel */
  public async waitForDashboardContainer(): Promise<boolean> {
    try {
      await Wait.waitForPresent(GrafanaMainPage.DASHBOARD_CONTAINER);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
