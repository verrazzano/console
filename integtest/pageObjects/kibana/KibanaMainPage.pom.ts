// Copyright (C) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";

/**
 * Page Object Model for Kibana main page
 */
export class KibanaMainPage {
  private static readonly PAGE_BODY: By = By.id("opensearch-dashboards-body");

  private static readonly SIDEMENU_CONTAINER: By = By.id("navDrawerMenu");

  protected pageUrl: string = "/";
  protected pageLoadedElement: By = KibanaMainPage.PAGE_BODY;

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForPageLoad();
  }

  /* Wait for page to load */
  public async waitForPageLoad(): Promise<boolean> {
    try {
      await Wait.waitForPresent(KibanaMainPage.PAGE_BODY);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
