// Copyright (C) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { PAGE_LOAD_TIMEOUT, Wait } from "../../utils/Wait";

/*
 Application details page
 */
export class ApplicationPage {
  // vz-console-oamapp is the outer envelope of the "body" of the application details page
  // if this exists, it means the content (i.e. not just header and footer) are rendered
  private static readonly APPLICATION_PAGE_OUTER_ELEM = By.css(
    "vz-console-oamapp"
  );

  private static readonly APP_NAME_METAITEM = By.id("app-name-metaitem");

  private static readonly APP_NAMESPACE_METAITEM = By.id(
    "app-namespace-metaitem"
  );

  private static readonly APP_CREATED_METAITEM = By.id("app-created-metaitem");
  private static readonly APP_CLUSTER_METAITEM = By.id("app-cluster-metaitem");
  private static readonly APP_PROJECT_METAITEM = By.id("app-project-metaitem");

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for application information */
  public async waitForApplicationInfo(): Promise<boolean> {
    try {
      await Wait.waitForPresent(ApplicationPage.APP_NAME_METAITEM);
      await Wait.waitForPresent(ApplicationPage.APP_NAMESPACE_METAITEM);
      return true;
    } catch (error) {
      return false;
    }
  }

  public async getAppNameItem(): Promise<string> {
    return this.getAppInfo(ApplicationPage.APP_NAME_METAITEM);
  }

  public async getAppNamespaceItem(): Promise<string> {
    return this.getAppInfo(ApplicationPage.APP_NAMESPACE_METAITEM);
  }

  public async getAppClusterItem(): Promise<string> {
    return this.getAppInfo(ApplicationPage.APP_CLUSTER_METAITEM);
  }

  public async componentExistsOnPage(compName: string): Promise<boolean> {
    return !!(await this.getAppInfo(By.id(`app-comp-${compName}`)));
  }

  private async getAppInfo(elementBy: By): Promise<string> {
    const appElem = await Wait.waitForPresent(elementBy);
    if (appElem) {
      return appElem.getText();
    }
    throw new Error(`Could not find element on page: ${elementBy.value}`);
  }

  private async waitForHeader(): Promise<boolean> {
    return Wait.waitForHeader();
  }

  public async errorComponentExists(): Promise<boolean> {
    try {
      // wait for body to be rendered and make sure no error component exists
      await Wait.waitForPresent(ApplicationPage.APPLICATION_PAGE_OUTER_ELEM);
      const errItem = await Wait.findNow(Wait.ERROR_ITEM);
      return !!errItem;
    } catch (error) {
      return false;
    }
  }
}
