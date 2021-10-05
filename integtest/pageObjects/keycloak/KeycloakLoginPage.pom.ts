// Copyright (C) 2020, 2021 Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { LoginInfo } from "../../utils/Utils";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";
import { Actions } from "../../utils/Actions";

/**
 * Page Object Model for the Keycloak login page
 */
export class KeycloakLoginPage {
  private static readonly LOGIN_FORM_BY: By = By.id("kc-form-login");
  private static readonly USERNAME_BY: By = By.id("username");
  private static readonly PASSWORD_BY: By = By.id("password");
  private static readonly LOGIN_BTN_BY: By = By.id("kc-login");
  private static readonly INVALID_CREDENTIALS_ERROR: By = By.className(
    "kc-feedback-text"
  );
  protected pageUrl: string = "/";
  protected pageLoadedElement: By = KeycloakLoginPage.LOGIN_FORM_BY;

  public async isCurrentPage(): Promise<boolean> {
    const elem = await Wait.waitForPresent(KeycloakLoginPage.LOGIN_FORM_BY);
    return !!elem;
  }

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    try {
      await Wait.waitForPresent(this.pageLoadedElement, timeOut);
      return true;
    } catch (error) {
      return false;
    }
  }

  public async login(loginInfo: LoginInfo, timeout?: number) {
    console.log("Performing Keycloak Login");
    const isUsernameBoxPresent = await this.waitForUsernameBox();

    if (isUsernameBoxPresent) {
      await Actions.enterText(
        KeycloakLoginPage.USERNAME_BY,
        loginInfo.username
      );
      await Actions.enterText(
        KeycloakLoginPage.PASSWORD_BY,
        loginInfo.password,
        true
      );
      await Actions.doClick(KeycloakLoginPage.LOGIN_BTN_BY);
    } else {
      throw new Error("No username box, could not login");
    }
  }

  public async waitForUsernameBox(): Promise<boolean> {
    return await Wait.waitForPresent(KeycloakLoginPage.USERNAME_BY)
      .then(() => true)
      .catch(() => false);
  }

  public async waitForInvalidCredentialsError(): Promise<boolean> {
    return await Wait.waitForPresent(
      KeycloakLoginPage.INVALID_CREDENTIALS_ERROR
    )
      .then(() => true)
      .catch(() => false);
  }
}
