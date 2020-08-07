// Copyright (C) 2020, Oracle and/or its affiliates.
import {AuthStorage} from "./AuthStorage";

// These are the JWT fields that we use for access and refresh token
// to check if expired
export interface CommonToken {

  /**
   * Expiration time stamp
   */
  exp: number;

  /**
   * Issued at time stamp
   */
  iat: number;

}


// This is the OpenID Connect token with user identify info
export interface IdentityToken {
  /**
   * Audience for this token (client id)
   */
  aud: string;

  /**
   * Expiration time stamp
   */
  exp: number;

  /**
   * Issued at time stamp
   */
  iat: number;

  /**
   * Issuer of this token
   */
  iss: string;

  /**
   * Token id
   */
  jti: string;

  /**
   * User name
   */
  name: string;

  /**
   * Client passed value, used to mitigate replay attacks
   */
  nonce: string;

  /**
   * Principal sub type
   */
  pstype: string;

  /**
   * Scope for this token
   */
  scope: string;

  /**
   * Security token hash
   */
  st_hash: string;

  /**
   * User id (guid) for native users
   */
  sub: string;

  /**
   * email
   */
  email: string;
}

/**
 * The KeycloakJwt class is responsible for parsing JWT tokens, extracting required information,
 * and determining if tokens are expired.
 */
export class KeycloakJwt {

  static jwtDecode = require('jwt_decode');

  public static decodeIdToken(token: string): IdentityToken{
    // const jwtDecode = require('jwt_decode');
    return KeycloakJwt.jwtDecode(token) as IdentityToken;
  }

  /**
   * Check if the access is expired or about to expire
   */
  public static isAccessTokenExpired(): boolean {
    return  Date.now() > AuthStorage.getAccessTokenExpiryTsMillis();
  }

  /**
   * Check if the refresh token is expired or about to expire
   */
  public static isRefreshTokenExpired(): boolean {
    return  Date.now() > AuthStorage.getRefreshTokenExpiryTsMillis();
  }

  /**
   * Calculate the expiry millis timestamp in local time for the given token
   * Figure out the clock skew, this assumes the token was just issued.
   * Use time buffer to ensure we don't send an expired token
   * to the Verazzano API.
   */
  public static calcExpiryTsMillis(token: string): number {
    const decoded: CommonToken = KeycloakJwt.jwtDecode(token) as CommonToken;

    // The JWT timestamps are in secs
    const createdTs: number = decoded.iat * 1000; // convert to mills
    const expireTs: number = decoded.exp * 1000; // convert to mills
    const now =  Date.now();
    const clockSkew: number = now - createdTs;

    const expiryBufferMillis = 30 * 1000;  // Expire 30 secs before actual time
    const newExpireTs = expireTs + clockSkew - expiryBufferMillis;
    return newExpireTs;
  }
}
