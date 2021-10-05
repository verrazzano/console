// Copyright (C) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for NGINX 502 error page
 */
export class ErrorPage502 {
  private static readonly ERROR_HEADER_502: By = By.css("h1");

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    try {
      const headerText = await (
        await Wait.waitForPresent(ErrorPage502.ERROR_HEADER_502)
      ).getText();
      console.log(headerText);
      return headerText === "502 Bad Gateway";
    } catch (error) {
      return false;
    }
  }
}
