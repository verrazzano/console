// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for Grafana main page
 */
export class GrafanaMainPage {
  private static readonly HEADER_CONTAINER: By = By.className("navbar");

  private static readonly SIDEMENU_CONTAINER: By = By.className("sidemenu");

  private static readonly GRAFANA_PANEL: By = By.css("grafana-panel");

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
      return false;
    }
  }

  /* Wait for sidement */
  public async waitForSidemenu(): Promise<boolean> {
    try {
      await Wait.waitForPresent(GrafanaMainPage.SIDEMENU_CONTAINER);
      return true;
    } catch (error) {
      return false;
    }
  }

  /* Wait for Grafana panel */
  public async waitForGrafanaPanel(): Promise<boolean> {
    try {
      await Wait.waitForPresent(GrafanaMainPage.GRAFANA_PANEL);
      return true;
    } catch (error) {
      return false;
    }
  }
}
