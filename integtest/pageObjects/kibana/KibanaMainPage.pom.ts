// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for Kibana main page
 */
export class KibanaMainPage {

  private static readonly HEADER_CONTAINER: By = By.className(
    "euiHeader"
  );

  private static readonly SIDEMENU_CONTAINER: By = By.id(
    "navDrawerMenu"
  );

  protected pageUrl: string = "/";
  protected pageLoadedElement: By = KibanaMainPage.HEADER_CONTAINER;

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    try {
      await Wait.waitForPresent(KibanaMainPage.HEADER_CONTAINER);
      return true;
    } catch (error) {
      return false;
    }
  }

  /* Wait for sidemenu */
  public async waitForSidemenu(): Promise<boolean> {
    try {
      await Wait.waitForPresent(KibanaMainPage.SIDEMENU_CONTAINER);
      return true;
    } catch (error) {
      return false;
    }
  }
}
