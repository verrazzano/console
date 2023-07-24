// Copyright (C) 2023, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait } from "../../utils/Wait";
import { Actions } from "../../utils/Actions";

/* Thanos Ruler HeaderBar Object Model */
export class ThanosRulerHeaderBar {
  /* component locators */

  private static readonly LOGO: By = By.className("navbar-brand");
  private static readonly THANOS_RULER_TITLE_LINK: By = By.xpath(
    /* For some odd reason, the navbar link content is split across 3 lines, so only look for the first line */
    "//a[contains(.,'Thanos -')]"
  );
  private static readonly THANOS_RULER_RULES_LINK: By = By.xpath(
    "//a[contains(.,'Rules')]"
  );

  /* Verify if Logo is present and has the title text link and rules link */
  public async selectLogo(): Promise<boolean> {
    const logo = await Wait.waitForPresent(ThanosRulerHeaderBar.LOGO);
    Actions.scrollIntoView(ThanosRulerHeaderBar.LOGO);
    const titleLink = await Wait.waitForPresent(
      ThanosRulerHeaderBar.THANOS_RULER_TITLE_LINK
    );
    const rulesLink = await Wait.waitForPresent(
      ThanosRulerHeaderBar.THANOS_RULER_RULES_LINK
    );
    return !!logo && !!titleLink && !!rulesLink;
  }
}
