// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait } from "../../utils/Wait";
import { Actions } from "../../utils/Actions";

/* Grafana SideBar Page Object Model */
export class GrafanaSideBar {
  /* component locators */

  private static readonly LOGO: By = By.className("sidemenu__logo");
  private static readonly USER_MENU_BUTTON: By = By.xpath(
    `//a[contains(@href,"/profile")]`
  );
  private static readonly USER_MENU_CONTENT: By = By.className(
    "dropdown-menu--sidemenu"
  );

  /* Verify if Logo is present */
  public async selectLogo(): Promise<boolean> {
    const logo = await Wait.waitForPresent(GrafanaSideBar.LOGO);
    Actions.scrollIntoView(GrafanaSideBar.LOGO);
    return !!logo;
  }

  /* Verify if User menu button is present */
  public async selectUserMenu(): Promise<boolean> {
    const userMenuButton = await Wait.waitForPresent(
      GrafanaSideBar.USER_MENU_BUTTON
    );
    Actions.scrollIntoView(GrafanaSideBar.USER_MENU_BUTTON);
    return !!userMenuButton;
  }

  /* Click the user menu button */
  public async clickUserMenu(): Promise<void> {
    await Actions.doClick(GrafanaSideBar.USER_MENU_BUTTON);
  }

  /* Verify if user menu  content is present */
  public async selectUserMenuContent(): Promise<boolean> {
    const userMenuContent = await Wait.waitForPresent(
      GrafanaSideBar.USER_MENU_CONTENT
    );
    await this.clickUserMenu();
    Actions.scrollIntoView(GrafanaSideBar.USER_MENU_CONTENT);
    return !!userMenuContent;
  }
}
