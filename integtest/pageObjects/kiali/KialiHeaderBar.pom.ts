// Copyright (C) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait } from "../../utils/Wait";
import { Actions } from "../../utils/Actions";

/* Kibana HeaderBar Page Object Model */
export class KialiHeaderBar {
  /* component locators */
  private static readonly LOGO: By = By.className("pf-c-brand");

  /* Verify if Logo is present */
  public async selectLogo(): Promise<boolean> {
    const logo = await Wait.waitForPresent(KialiHeaderBar.LOGO);
    Actions.scrollIntoView(KialiHeaderBar.LOGO);
    return !!logo;
  }
}
