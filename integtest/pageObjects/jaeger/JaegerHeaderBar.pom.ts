// Copyright (C) 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait } from "../../utils/Wait";
import { Actions } from "../../utils/Actions";

/* JaegerHeaderBar HeaderBar Page Object Model */
export class JaegerHeaderBar {
  /* component locators */
  private static readonly SEARCH_LEFT_SIDEBAR: By = By.className(
    "SearchTracePage--find"
  );
  private static readonly SEARCH_RIGHT_COLUMN: By = By.className(
    "SearchTracePage--column"
  );
  private static readonly SEARCH_LINK: By = By.href("/search");
  private static readonly COMPARE_LINK: By = By.href("/trace/...");
  private static readonly ARCHITECTURE_LINK: By = By.href("/dependencies");

  private static readonly TRACE_DIFF_HEADER: By = By.className(
    "TraecDiffHeader--traceHeader"
  );
  private static readonly ARCHITECTURE_CONTENT: By = By.className(
    "Page--content--no-embedded"
  );

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

  /* Wait for Architecture content */
  public async waitForArchitectureContent(): Promise<boolean> {
    try {
      await Wait.waitForPresent(JaegerHeaderBar.ARCHITECTURE_CONTENT);
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

  /* Click the compare traces tab */
  public async clickArchitectureTab(): Promise<void> {
    await Actions.doClick(JaegerHeaderBar.ARCHITECTURE_LINK);
  }
}
