// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as OjModel from "ojs/ojmodel";
import { Keycloak } from "./Keycloak";
import { AuthStorage } from "./AuthStorage";
import { KeycloakUrls } from "./KeycloakUrls";
import { FetchApiSignature } from "vz-console/service/types";
import * as Messages from "vz-console/utils/Messages";

/**
 * Singleton Class KeycloakJet provides Oracle JET oauth integration with Keycloak
 */
export class KeycloakJet {
  private static keycloakJetInstance: KeycloakJet;

  jetOauth: OjModel.OAuth;
  keycloak: Keycloak;
  addKcAuthHeader: boolean;

  public static getInstance(): KeycloakJet {
    if (!KeycloakJet.keycloakJetInstance) {
      KeycloakJet.keycloakJetInstance = new KeycloakJet();
      KeycloakJet.keycloakJetInstance
        .initAuth()
        .then(() => console.log(Messages.Auth.msgAuthInit()));
    }
    return KeycloakJet.keycloakJetInstance;
  }

  private constructor() {
    this.keycloak = Keycloak.getInstance();
    this.jetOauth = new OjModel.OAuth({}, "Authorization");
  }

  async initAuth(): Promise<void> {
    // Only use keycloak if URL defined, otherwise this is dev testing mode
    if (!KeycloakUrls.getInstance().isAuthEnabled()) {
      return;
    }

    // If the access token doesn't exist, we need to login, OR finish the login
    // steps when keycloak is calling back to this code.
    if (!AuthStorage.accessTokenExists()) {
      console.log(Messages.Auth.msgTokenNotInStorage());
      // If this is not the callback from keycloak then the user needs to be authenticated
      if (!Keycloak.isReturnFromKeycloakLogin()) {
        console.log(Messages.Auth.msgLogInKeyCloak());
        // Send the auth GET request to keycloak to authenticate the user
        // This will result in the keycloak login page being displayed if
        // the user session doesn't exist.
        this.keycloak.sendAuthRequest();
      } else {
        console.log(Messages.Auth.msgGetAccessToken());
        // This is the keycloak callback, get the tokens and save them.
        await Keycloak.fetchToken();
      }
    }
  }

  /**
   * Get an authentication-enabled version of the fetch API, for use with Verrazzano API
   */
  public getAuthenticatedFetchApi(
    addKcAuthHeader: boolean = false
  ): FetchApiSignature {
    if (KeycloakUrls.getInstance().isAuthEnabled) {
      this.addKcAuthHeader = addKcAuthHeader;
      return this.authenticatedFetch.bind(this);
    } else {
      return window.fetch.bind(window);
    }
  }

  /**
   * A fetch wrapper to make authenticated requests to the Verrazzano API.
   * @param input - The url or Request object
   * @param init - If url is provided, init is a RequestInit object that provides additional options for the Request
   * @return The http response promise.
   */
  private async authenticatedFetch(
    input: string | Request,
    // eslint-disable-next-line no-undef
    init?: RequestInit
  ): Promise<Response> {
    try {
      if (input) {
        const request =
          input instanceof Request ? input : new Request(input, init);
        const authRequest = await this.keycloak.createAuthorizedRequest(
          request,
          this.addKcAuthHeader
        );
        return window.fetch(authRequest);
      }
    } catch (error) {
      let errorMessage = error;
      if (error && error.message) {
        errorMessage = error.message;
      }
      throw new Error(Messages.Error.errFetchFailed(`${errorMessage}`));
    }
  }

  /**
   * Get currently logged in user name
   */
  public getUsername(): string {
    return AuthStorage.getUsername();
  }

  /**
   * Get currently logged in user's email
   */
  public getUserEmail(): string {
    return AuthStorage.getEmail();
  }

  /**
   * Logout the currently logged in user
   */
  public async logout(): Promise<void> {
    return this.keycloak.logoutSession();
  }
}
