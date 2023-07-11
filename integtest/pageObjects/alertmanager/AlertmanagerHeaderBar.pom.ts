// Copyright (C) 2023, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Actions } from "../../utils/Actions";

/* AlertmanagerHeaderBar HeaderBar Page Object Model */
export class AlertmanagerHeaderBar {
  /* component locators */
  private static readonly ALERTS_LINK: By = By.xpath(
    `//a[contains(@href,"/alerts")]`
  );

  private static readonly SILENCES_LINK: By = By.xpath(
    `//a[contains(@href,"/silences")]`
  );

  private static readonly STATUS_LINK: By = By.xpath(
    `//a[contains(@href,"/status")]`
  );

  private static readonly SETTINGS_LINK: By = By.xpath(
    `//a[contains(@href,"/settings")]`
  );

  /* Click the alerts link */
  public async clickAlertsLink(): Promise<void> {
    await Actions.doClick(AlertmanagerHeaderBar.ALERTS_LINK);
  }

  /* Click the silences link */
  public async clickSilencesLink(): Promise<void> {
    await Actions.doClick(AlertmanagerHeaderBar.SILENCES_LINK);
  }

  /* Click the status link */
  public async clickStatusLink(): Promise<void> {
    await Actions.doClick(AlertmanagerHeaderBar.STATUS_LINK);
  }

  /* Click the settings link */
  public async clickSettingsLink(): Promise<void> {
    await Actions.doClick(AlertmanagerHeaderBar.SETTINGS_LINK);
  }
}
