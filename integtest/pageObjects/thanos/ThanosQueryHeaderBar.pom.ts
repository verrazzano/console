// Copyright (C) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait } from "../../utils/Wait";
import { Actions } from "../../utils/Actions";

/* Thanos Query HeaderBar Object Model */
export class ThanosQueryHeaderBar {
  /* component locators */

  private static readonly LOGO: By = By.className("navbar-brand");
  private static readonly THANOS_QUERY_TITLE_LINK: By = By.xpath(
      "//a[class='navbar-brand'][contains(.,'Thanos')]"
  );

  /* Verify if Logo is present and has the title text link */
  public async selectLogo(): Promise<boolean> {
    const logo = await Wait.waitForPresent(ThanosQueryHeaderBar.LOGO);
    Actions.scrollIntoView(ThanosQueryHeaderBar.LOGO);
    const titleLink = await Wait.waitForPresent(ThanosQueryHeaderBar.THANOS_QUERY_TITLE_LINK)
    return !!logo && !! titleLink;
  }
}
