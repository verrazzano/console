
// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// Keys used for local storage
import {IdentityToken, KeycloakJwt} from "./KeycloakJwt";

// The OAuth2 access token
const KEY_ACCESS_TOKEN = "vz-accessToken";

// The local expiry timestamp of the access token
const KEY_ACCESS_EXPIRY_TS_MILLIS = "vz-accessExpire";

// The OAuth2 refresh token
const KEY_REFRESH_TOKEN = "vz-refreshToken";

// The local expiry timestamp of the access token
const KEY_REFRESH_EXPIRY_TS_MILLIS = "vz-refreshExpireTsMillis";

// The OAuth2 state
const KEY_STATE = "vz-idState";

// The OAuth2 PKCE verifier
const KEY_VERIFIER = "vz-verifier";

// The OpenID Connect ID token
const KEY_ID_TOKEN = "vz-idToken";

// The user name extracted from the ID token
const KEY_USERNAME = "vz-idUsername";

// The state name extracted from the ID token
const KEY_EMAIL = "vz-idEmail";

/**
 * The AuthStorage class uses browser storage to get/set tokens, ID information,
 * and anything else auth related that requires storage.
 */
export class AuthStorage {
  public static accessTokenExists(): boolean {
    const token = this.getAccessToken();
    return (token !== null && token !== "");
  }

  /**
   * Access Token
   */
  public static getAccessToken(): string {
    return window.localStorage.getItem(KEY_ACCESS_TOKEN) as string;
  }
  public static setAccessToken(val: string): void {
    return window.localStorage.setItem(KEY_ACCESS_TOKEN, val)
  }
  public static removeAccessToken(): void {
    window.localStorage.removeItem(KEY_ACCESS_TOKEN);
  }
  public static getAccessTokenExpiryTsMillis(): number {
    return AuthStorage.getNumber(KEY_ACCESS_EXPIRY_TS_MILLIS);
  }
  public static setAccessTokenExpiryTsMillis(ts: number): void {
    return window.localStorage.setItem(KEY_ACCESS_EXPIRY_TS_MILLIS, ts.toString())
  }

  /**
   * Refresh token
   */
  public static getRefreshToken(): string {
    return window.localStorage.getItem(KEY_REFRESH_TOKEN) as string;
  }
  public static getRefreshTokenExpiryTsMillis(): number {
    return AuthStorage.getNumber(KEY_REFRESH_EXPIRY_TS_MILLIS);
  }
  public static setRefreshTokenExpiryTsMillis(ts: number): void {
    return window.localStorage.setItem(KEY_REFRESH_EXPIRY_TS_MILLIS, ts.toString())
  }

  /**
   * User info
   */
  public static getUsername(): string {
    return window.localStorage.getItem(KEY_USERNAME) || "" as string;
  }
  public static getEmail(): string {
    return window.localStorage.getItem(KEY_EMAIL) || "" as string;
  }

  /**
   * OAuth2 protocol related
   */
  public static getState(): string {
    return window.localStorage.getItem(KEY_STATE) as string;
  }
  public static setState(val: string): void {
    return window.localStorage.setItem(KEY_STATE, val);
  }

  public static getVerifier(): string {
    return window.localStorage.getItem(KEY_VERIFIER) as string;
  }
  public static setVerifier(val: string): void {
    window.localStorage.setItem(KEY_VERIFIER, val);
  }
  public static removeVerifier(): void {
    window.localStorage.removeItem(KEY_VERIFIER);
  }

  /**
   * Store the token retrieved by getToken and Refresh
   * Note that refresh optionally returns a new refresh and ID token
   */
  public static storeIdAndTokens(json: any): void {
    const accessToken = json.access_token;
    const refreshToken = json.refresh_token;
    window.localStorage.setItem(KEY_ACCESS_TOKEN, accessToken);

    if (refreshToken && refreshToken !== "") {
      window.localStorage.setItem(KEY_REFRESH_TOKEN, refreshToken);
    }

    const idToken = json.id_token;
    if (idToken && idToken !== "") {
      const decodedIdToken: IdentityToken = KeycloakJwt.decodeIdToken(idToken);
      window.localStorage.setItem(KEY_ID_TOKEN, idToken);
      window.localStorage.setItem(KEY_USERNAME, decodedIdToken.name);
      window.localStorage.setItem(KEY_EMAIL, decodedIdToken.email);
    }
  }

  public static clearAuthStorage(): void {
    window.localStorage.removeItem(KEY_ACCESS_TOKEN);
    window.localStorage.removeItem(KEY_ACCESS_EXPIRY_TS_MILLIS);
    window.localStorage.removeItem(KEY_REFRESH_TOKEN);
    window.localStorage.removeItem(KEY_REFRESH_EXPIRY_TS_MILLIS);
    window.localStorage.removeItem(KEY_ID_TOKEN);
    window.localStorage.removeItem(KEY_USERNAME);
    window.localStorage.removeItem(KEY_EMAIL);
    window.localStorage.removeItem(KEY_STATE);
    window.localStorage.removeItem(KEY_VERIFIER);
  }

  private static getNumber(key: string): number {
    const val = window.localStorage.getItem(key);
    return val ? parseInt(val,10) : Date.now();
  }
}
