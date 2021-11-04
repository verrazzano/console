// Copyright (C) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for Kiali main page
 */
export class KialiMainPage {
  private static readonly HEADER_CONTAINER: By = By.id("nav-toggle");

  private static readonly SIDEMENU_CONTAINER: By = By.id("page-sidebar");

  protected pageUrl: string = "/";
  protected pageLoadedElement: By = KialiMainPage.HEADER_CONTAINER;

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    try {
      await Wait.waitForPresent(KialiMainPage.HEADER_CONTAINER);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for sidemenu */
  public async waitForSidemenu(): Promise<boolean> {
    try {
      await Wait.waitForPresent(KialiMainPage.SIDEMENU_CONTAINER);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
