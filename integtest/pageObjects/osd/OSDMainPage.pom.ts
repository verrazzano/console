// Copyright (C) 2021, 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for OSD main page
 */
export class OSDMainPage {
  private static readonly PAGE_BODY: By = By.id("opensearch-dashboards-body");
  protected pageUrl: string = "/";
  protected pageLoadedElement: By = OSDMainPage.PAGE_BODY;

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForPageLoad();
  }

  /* Wait for page to load */
  public async waitForPageLoad(): Promise<boolean> {
    try {
      await Wait.waitForPresent(OSDMainPage.PAGE_BODY);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
