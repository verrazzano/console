// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../utils/Wait";

/**
 * Page Object Model for the main page
 */
export class MainPage {
  // private static readonly HEADER_CONTAINER: By = By.xpath(`//header[@class="oj-web-applayout-header"]`);
  private static readonly FOOTER_CONTAINER: By = By.className(
    "oj-web-applayout-footer-item"
  );

  private static readonly HEADER_CONTAINER: By = By.className(
    "oj-web-applayout-header"
  );

  private static readonly INSTANCE_STATUS_ITEM: By = By.id(
    "instance-status-metaitem"
  );

  private static readonly INSTANCE_VERSION_ITEM: By = By.id(
    "instance-version-metaitem"
  );

  private static readonly INSTANCE_PROFILE_ITEM: By = By.id(
    "instance-profile-metaitem"
  );

  // vz-console-instance is the outer envelope of the "body" of the main page
  // if this exists, it means the content (i.e. not just header and footer) are rendered
  private static readonly INSTANCE_BODY_OUTER_ELEM = By.css(
    "vz-console-instance"
  );

  // vz-console-error is the tag name of the error item
  private static readonly ERROR_ITEM: By = By.css("vz-console-error");

  protected pageUrl: string = "/";
  protected pageLoadedElement: By = MainPage.HEADER_CONTAINER;

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    try {
      await Wait.waitForPresent(MainPage.HEADER_CONTAINER);
      return true;
    } catch (error) {
      return false;
    }
  }

  /* Wait for footer */
  public async waitForFooter(): Promise<boolean> {
    try {
      await Wait.waitForPresent(MainPage.FOOTER_CONTAINER);
      return true;
    } catch (error) {
      return false;
    }
  }

  /* Wait for instance General Information */
  public async waitForInstanceInfo(): Promise<boolean> {
    try {
      await Wait.waitForPresent(MainPage.INSTANCE_STATUS_ITEM);
      await Wait.waitForPresent(MainPage.INSTANCE_VERSION_ITEM);
      await Wait.waitForPresent(MainPage.INSTANCE_PROFILE_ITEM);
      return true;
    } catch (error) {
      return false;
    }
  }

  /* Wait for instance General Information */
  public async errorComponentExists(): Promise<boolean> {
    try {
      // wait for body to be rendered and make sure no error component exists
      await Wait.waitForPresent(MainPage.INSTANCE_BODY_OUTER_ELEM);
      const errItem = await Wait.findNow(MainPage.ERROR_ITEM);
      return !!errItem;
    } catch (error) {
      return false;
    }
  }
}
