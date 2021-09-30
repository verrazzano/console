// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait } from "../../utils/Wait";
import { Actions } from "../../utils/Actions";

/* Console HeaderBar Page Object Model */
export class ConsoleHeaderBar {
  /* component locators */

  private static readonly LOGO: By = By.className("vz-icon");
  private static readonly USER_MENU_BUTTON: By = By.id("userMenu");
  private static readonly USER_MENU_CONTENT: By = By.className(
    "dropmenu__content"
  );

  /* Verify if Logo is present */
  public async selectLogo(): Promise<boolean> {
    const logo = await Wait.waitForPresent(ConsoleHeaderBar.LOGO);
    Actions.scrollIntoView(ConsoleHeaderBar.LOGO);
    return !!logo;
  }

  /* Verify if User menu button is present */
  public async selectUserMenu(): Promise<boolean> {
    const userMenuButton = await Wait.waitForPresent(
      ConsoleHeaderBar.USER_MENU_BUTTON
    );
    Actions.scrollIntoView(ConsoleHeaderBar.USER_MENU_BUTTON);
    return !!userMenuButton;
  }

  /* Click the user menu button */
  public async clickUserMenu(): Promise<void> {
    await Actions.doClick(ConsoleHeaderBar.USER_MENU_BUTTON);
  }

  /* Verify if user menu  content is present */
  public async selectUserMenuContent(): Promise<boolean> {
    const userMenuContent = await Wait.waitForPresent(
      ConsoleHeaderBar.USER_MENU_CONTENT
    );
    Actions.scrollIntoView(ConsoleHeaderBar.USER_MENU_CONTENT);
    return !!userMenuContent;
  }
}