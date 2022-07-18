// Copyright (C) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { LoginInfo } from "../../utils/Utils";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";
import { Actions } from "../../utils/Actions";

/**
 * Page Object Model for the Keycloak login page
 */
export class KeycloakLoginPage {
  private static readonly LOGIN_FORM: By = By.id("kc-form-login");
  private static readonly USERNAME: By = By.id("username");
  private static readonly PASSWORD: By = By.id("password");
  private static readonly LOGIN_BTN: By = By.id("kc-login");
  private static readonly INVALID_CREDENTIALS_ERROR: By =
    By.className("kc-feedback-text");

  protected pageUrl: string = "/";
  protected pageLoadedElement: By = KeycloakLoginPage.LOGIN_FORM;

  public async isCurrentPage(): Promise<boolean> {
    const elem = await Wait.waitForPresent(KeycloakLoginPage.LOGIN_FORM);
    return !!elem;
  }

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    try {
      await Wait.waitForPresent(this.pageLoadedElement, timeOut);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async login(loginInfo: LoginInfo, timeout?: number) {
    console.log("Performing Keycloak Login");
    const isUsernameBoxPresent = await this.waitForUsernameBox();

    if (isUsernameBoxPresent) {
      await Actions.enterText(KeycloakLoginPage.USERNAME, loginInfo.username);
      await Actions.enterText(
        KeycloakLoginPage.PASSWORD,
        loginInfo.password,
        true
      );
      await Actions.doClick(KeycloakLoginPage.LOGIN_BTN);
    } else {
      throw new Error("No username box, could not login");
    }
  }

  public async waitForUsernameBox(): Promise<boolean> {
    return await Wait.waitForPresent(KeycloakLoginPage.USERNAME)
      .then(() => true)
      .catch((error) => {
        console.log(error);
        return false;
      });
  }

  public async waitForInvalidCredentialsError(): Promise<boolean> {
    return await Wait.waitForPresent(
      KeycloakLoginPage.INVALID_CREDENTIALS_ERROR
    )
      .then(() => true)
      .catch((error) => {
        console.log(error);
        return false;
      });
  }
}
