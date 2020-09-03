// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { AuthStorage } from "./AuthStorage";
import {KeycloakUrls} from "./KeycloakUrls";
import {KeycloakJwt} from "./KeycloakJwt";
import * as Messages from "vz-console/utils/Messages"
import * as logger from "ojs/ojlogger"

/**
 * The Keycloak class is responsible for calling the keycloak API to:
 *   - Get an access token using authorization code grant type
 *   -  Get an access token using refresh grant type
 *   -  Logout.
 *
 * Verrazzano uses OpenID Connect with OAuth2 PKCE.  This uses a 3-legged OAuth2 flow
 * as follows:
 *    1. (leg 1) UI calls Keycloak /auth endpoint to get an authorization code
 *      1.1. (leg 2)Keycloak will present user with a login form, only if there is no session
 *      1.2. Keycloak will redirect to the UI authcallback page (see Main.tsx in the plugin)
 *           with an authorization code in the URL params
 *    2. (leg 3) Before displaying the callback page, the UI will call keycloak again to get the
 *       access, refresh, and ID token using a POST.  The stores those tokens in browswer
 *       storage.
 *    3. The UI displays the ID information in the header
 *    4. The UI adds the access token as an authorization header to every HTTP call going to
 *       Verrazzzano API.
 */
export class Keycloak {

  private static instance: Keycloak;
  public static getInstance() {
    if (!Keycloak.instance) {
      Keycloak.instance = new Keycloak();
    }
    return Keycloak.instance;
  }

  private constructor() {

  }

  /**
   * Logon user, by redirecting to Keycloak.
   * This function purposely return a promise that will never resolved except if there is an error,
   * to give enough time to perform browser redirect.
   */
  public async sendAuthRequest(
): Promise<void> {
    return new Promise<void>(async (_) => {
      try {
        const urls = KeycloakUrls.getInstance();
        const verifier = this.getRandomBase64();
        const state = this.getRandomBase64();
        const nonce = this.getRandomBase64();
        const data = await this.sha256(verifier);
        const arr = new Uint8Array(data);
        const challenge = this.base64URLEncode(arr);
        const encCallback = encodeURIComponent(urls.getCallbackUrl());

        AuthStorage.setVerifier(verifier);
        AuthStorage.setState(state);

        const loginUrl = urls.getAuthUrlPrefix()
          + "?client_id=" + urls.getClientId()
          + "&response_type=code"
          + "&scope=openid"
          + "&state=" + state
          + "&nonce=" + nonce
          + "&code_challenge=" + challenge
          + "&code_challenge_method=S256"
          + "&redirect_uri=" + encCallback;

        Keycloak.replaceWindowLocation(loginUrl);

        // Purposely do not resolve promise to give enough time for "window.location.replace" to do its job
      } catch (error) {
        Keycloak.goToErrorPage(Messages.Error.errSendAuthReq(error.toString()));
      }
    });
  }

  /**
   * Get the access token.
   *
   * @param authCode = the authorization code
   */
  public static async fetchToken(
  ): Promise<void> {
    return new Promise<void>(async (_) => {
      try {
        const urls = KeycloakUrls.getInstance();
        const authCode = this.getAuthCode() as String;
        const verifier = AuthStorage.getVerifier();

        const formData = new URLSearchParams();
        formData.append('grant_type','authorization_code');
        formData.append('code',authCode.toString());
        formData.append('redirect_uri',urls.getCallbackUrl());
        formData.append('client_id',urls.getClientId());
        formData.append('code_verifier', verifier.toString());
        const formBody = formData.toString();

        // Wait for HTTP headers
        const response = await fetch(urls.getTokenUrlPrefix(), {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, *cors, same-origin
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formBody
        });

        if (response.status >= 400) {
          Keycloak.goToErrorPage(Messages.Error.errAccessToken(response.statusText));
        }
        // Wait for body, then get access tokem, refresh token, id token
        const json = await response.json();

        // Save the expire timestamps, accounting for the Keycloak server clock skew
        AuthStorage.setAccessTokenExpiryTsMillis(KeycloakJwt.calcExpiryTsMillis(json.access_token));
        AuthStorage.setRefreshTokenExpiryTsMillis(KeycloakJwt.calcExpiryTsMillis(json.refresh_token));

        AuthStorage.storeIdAndTokens(json);
        AuthStorage.removeVerifier();

        const s = urls.getCallbackUrl();
        Keycloak.replaceWindowLocation(s);

      } catch (error) {
        Keycloak.goToErrorPage(Messages.Error.errAccessToken(error));
      }
    });
  }

  /**
   * Refresh the access token.
   *
   */
  public async refreshToken(
  ): Promise<void> {
      try {
        const urls = KeycloakUrls.getInstance();
        const rToken = AuthStorage.getRefreshToken();
        const formData = new URLSearchParams();

        formData.append('grant_type','refresh_token');
        formData.append('refresh_token', rToken);
        formData.append('redirect_uri',urls.getCallbackUrl());
        formData.append('client_id',urls.getClientId());
        const formBody = formData.toString();

        AuthStorage.removeAccessToken();

        // Wait for HTTP headers
        const response = await fetch(urls.getTokenUrlPrefix(), {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, *cors, same-origin
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formBody
        });

        if (response.status >= 400) {
          Keycloak.goToErrorPage(Messages.Error.errRefreshToken(response.statusText));
        }

        // Wait for body, then get access tokem, refresh token, id token
        const json = await response.json();

        // NOTE: Keycloak refresh will return a new access token and optionally a new refresh token
        // in which case we MUST use the new refresh token.
        // See https://tools.ietf.org/html/rfc6749#section-6
        // Save the expires timestamps, accounting for the Keycloak server clock skew
        //
        AuthStorage.setAccessTokenExpiryTsMillis(KeycloakJwt.calcExpiryTsMillis(json.access_token));
        if (json.refresh_token && json.refresh_token !== "") {
          AuthStorage.setRefreshTokenExpiryTsMillis(KeycloakJwt.calcExpiryTsMillis(json.refresh_token));
        }
        AuthStorage.storeIdAndTokens(json);
      } catch (error) {
        Keycloak.goToErrorPage(Messages.Error.errRefreshToken(error));
      }
  }

  /**
   * Logout the user session
   */
  public async logoutSession(
  ): Promise<void> {
    return new Promise<void>(async (_) => {

      try {
        const urls = KeycloakUrls.getInstance();
        const rToken = AuthStorage.getRefreshToken();
        const formData = new URLSearchParams();
        formData.append('refresh_token', rToken);
        formData.append('redirect_uri',encodeURIComponent(urls.getCallbackUrl()));
        formData.append('client_id',urls.getClientId());
        const formBody = formData.toString();

        AuthStorage.clearAuthStorage();

        // Wait for HTTP headers
        const response = await fetch(urls.getLogoutUrlPrefix(), {
          method: 'POST',
          mode: 'no-cors', // no-cors, *cors, same-origin
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': "Bearer : " + AuthStorage.getAccessToken(),
          },
          body: formBody
        });

        if (response.status >= 400) {
          Keycloak.goToErrorPage(Messages.Error.errLoggingOut(response.statusText));
        }

        Keycloak.replaceWindowLocation(urls.getCallbackUrl());

      } catch (error) {
        Keycloak.goToErrorPage(Messages.Error.errLoggingOut(error.toString()))
      }
    });
  }

  /**
   * Returns a copy of the request with authorization header containing the access
   * code bearer token, making sure to check the validity and refresh the authorization
   * token if needed. This method should be invoked every time the UI makes
   * a fetch request to the Verrazzano API
   * @param request
   * @returns a Promise of a modified Request object
   */
  public async createAuthorizedRequest(request: Request): Promise<Request> {
      await this.handleTokenExpirations();
      return this.addAuthHeader(request);
  }

  /**
   * Check for access token expiration and refresh token expiration.
   * Refresh the token or re-login the user as needed
   */
  private async handleTokenExpirations() {
    if (KeycloakJwt.isAccessTokenExpired()) {
      if (!KeycloakJwt.isRefreshTokenExpired()) {
          // Getting a new access token via the refresh token.
          // This is completely transparent to the user
          // If there is an error then the user will be redirected to
          // an error page.
          await this.refreshToken();
      } else {
          // Both access and refresh token are expired.  Need
          // to have the user login.  If the session is still
          // active then the user will just be sent to home page,
          // otherwise a keycloak login page will be shown.
          AuthStorage.clearAuthStorage();
          Keycloak.replaceWindowLocation(KeycloakUrls.getInstance().getHomePageUrl());
      }
    }
  }
  /**
   * Add the access code as a bearer token to the Authorization header
   */
  public addAuthHeader(req: Request): Request {
    const token = AuthStorage.getAccessToken();
    if (!token) {
      return req;
    }
    req.headers.set("Authorization", "Bearer " + token);
    return req;
  }

  /**
   * Return true if this is a callback from keyCloak
   */
  public static isReturnFromKeycloakLogin(): boolean {
    return Keycloak.getAuthCode() !== null;
  }

  /**
   * Get the auth code from the redirect url query params.
   * Return null if the code doesn't exist
   */
  public static getAuthCode(): string | null {
    const urlParams =  new URLSearchParams(window.location.search);

    // Verify the state was passed back
    if (AuthStorage.getState() !== urlParams.get("state")) {
      return null;
    }
    return urlParams.get("code");
  }

  /**
   * Get a SHA26 digest of the input string
   */
  private async sha256(message: string): Promise<any> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
  }

  /**
   * Base64 encode the binary buffer
   */
  private  base64URLEncode(buf: any) :string {
    const s = String.fromCharCode(...buf);
    const base64String = btoa(s)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

    return base64String;
  }

  /**
   * Get a random Base64 encoded string
   */
  private getRandomBase64(): string {
    const byteArray = new Uint8Array(32);
    window.crypto.getRandomValues(byteArray);
    return this.base64URLEncode(byteArray);
  }

  /**
   * Display the error page.
   *
   * @param errorMsg - the error message
   */
  public static goToErrorPage(errMsg: string): void {

    // Clear out all tokens to force a new login
    AuthStorage.clearAuthStorage();

    const s = KeycloakUrls.getInstance().getHomePageUrl();
    console.error(Messages.Error.errLoggingOut(errMsg));
    Keycloak.replaceWindowLocation(s);
  }

  /**
   * Wrapper function for window.location, to allow unit test stubbing
   * @param loc Location to go to.
   */
  public static replaceWindowLocation(loc: string) {
    window.location.replace(loc);
  }
}
