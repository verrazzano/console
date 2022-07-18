// Copyright (C) 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait } from "../../utils/Wait";
import { Actions } from "../../utils/Actions";

/* JaegerHeaderBar HeaderBar Page Object Model */
export class JaegerHeaderBar {
  /* component locators */
  private static readonly SEARCH_LEFT_SIDEBAR: By = By.className(
    "ant-tabs-tab-active"
  );

  private static readonly SEARCH_RIGHT_COLUMN: By = By.className(
    "SearchTracePage--column"
  );

  private static readonly SEARCH_LINK: By = By.xpath(
    `//a[contains(@href,"/search")]`
  );

  private static readonly COMPARE_LINK: By = By.xpath(
    `//a[contains(@href,"/trace/...")]`
  );

  private static readonly MONITOR_LINK: By = By.xpath(
    `//a[contains(@href,"/monitor")]`
  );

  private static readonly TRACE_DIFF_HEADER: By =
    By.className("TraecDiffHeader");

  private static readonly MONITOR_CONTENT: By = By.className("ant-row");

  /* Wait for search left sidebar */
  public async waitForSearchSidebar(): Promise<boolean> {
    try {
      await Wait.waitForPresent(JaegerHeaderBar.SEARCH_LEFT_SIDEBAR);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for search left sidebar */
  public async waitForSearchColumn(): Promise<boolean> {
    try {
      await Wait.waitForPresent(JaegerHeaderBar.SEARCH_RIGHT_COLUMN);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for trace diff selector */
  public async waitForTraceDiffSelector(): Promise<boolean> {
    try {
      await Wait.waitForPresent(JaegerHeaderBar.TRACE_DIFF_HEADER);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for Monitor content */
  public async waitForMonitorContent(): Promise<boolean> {
    try {
      await Wait.waitForPresent(JaegerHeaderBar.MONITOR_CONTENT);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Click the compare search tab */
  public async clickSearchTab(): Promise<void> {
    await Actions.doClick(JaegerHeaderBar.SEARCH_LINK);
  }

  /* Click the compare traces tab */
  public async clickCompareTracesTab(): Promise<void> {
    await Actions.doClick(JaegerHeaderBar.COMPARE_LINK);
  }

  /* Click the compare monitor tab */
  public async clickMonitorTab(): Promise<void> {
    await Actions.doClick(JaegerHeaderBar.MONITOR_LINK);
  }
}
