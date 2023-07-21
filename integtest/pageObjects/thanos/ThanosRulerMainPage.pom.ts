// Copyright (C) 2023, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for Thanos Ruler main page
 */
export class ThanosRulerMainPage {
  private static readonly HEADER_CONTAINER: By = By.className("navbar");

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    try {
      await Wait.waitForPresent(ThanosRulerMainPage.HEADER_CONTAINER);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
