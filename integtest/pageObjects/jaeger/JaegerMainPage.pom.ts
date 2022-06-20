// Copyright (C) 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for Jaeger main page
 */
export class JaegerMainPage {
  private static readonly HEADER_CONTAINER: By = By.className("ant-layout-header")


  protected pageUrl: string = "/";
  protected pageLoadedElement: By = JaegerMainPage.HEADER_CONTAINER;

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    try {
      await Wait.waitForPresent(JaegerMainPage.HEADER_CONTAINER);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }


}
