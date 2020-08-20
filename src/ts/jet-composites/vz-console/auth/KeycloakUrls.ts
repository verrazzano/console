// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// This is the ENV runtime override, see server.js.
const vzAuth = (window as any).vzAuth;
const vzKeycloakUrl = (window as any).vzKeycloakUrl;
const vzUiUrl = (window as any).vzUiUrl;
const vzClientId = (window as any).vzClientId;

// These are Keycloak config values set at install time
const REALM = "verrazzano-system";

// The plugin callback page
const CALLBACK = "verrazzano/authcallback";

// Home URL
const HOME_PAGE = "";

// Error URL
const ERROR_PAGE = "verrazzano/error";

// The KeycloakUrls singleton class provides all of URLs used by the
// standalone UI.
//
// 4 ENV vars are used.
//
// VZ_AUTH: false disables OAUTH2 with Keycloak
// VZ_UI_URL: the UI URL homepage:  E.G http://localhost:8183
// VZ_KEYCLOAK_URL: the keycloak url:  E.G. https://keycloak.myvz.v8o.oracledx.com:443
// VZ_CLIENT_ID: the client ID for for dev :  E.G dev-webui
//
// You can disable OAUTH by defining VZ_AUTH=false, OAUTH2 is enabled by default.
// If you do not disable OAUTH2 then you must provide the keycloak URL, there is no default.
export class KeycloakUrls {

  private authEnabled: boolean = true;

  // URL of keycloak server used by the verrazzano instance
  private keycloakUrl: string;

  // URL home page
  private uiUrl: string = window.location.protocol + '//' + window.location.host;

  // Client ID. let env override for dev
  private clientId: string = "webui";

  // The singleton instance
  private static _instance: KeycloakUrls;

  // URL of keycloak proxy - api requests to keycloak are proxied through console container in k8s
  private keycloakProxyUrl: string;

  // Private constructor to enforce singleton
  private constructor() {
    if (vzClientId && vzClientId !== "") {
      this.clientId = vzClientId;
    }

    if (vzUiUrl && vzUiUrl !== "") {
      this.uiUrl = vzUiUrl;
    }
    
    if (vzAuth && vzAuth !== "") {
      this.authEnabled = vzAuth.toLowerCase() !== "false";
    }

    if (this.authEnabled) {
      if (vzKeycloakUrl && vzKeycloakUrl !== "") {
        this.keycloakUrl = vzKeycloakUrl.toLowerCase();
        this.keycloakProxyUrl = this.keycloakUrl;
      }
      if (!this.keycloakProxyUrl) {
        this.keycloakProxyUrl = "/keycloak"; 
      }
    }
    console.log("VZ - Auth enabled = " + this.authEnabled);
    console.log("VZ - UI URL = " + this.uiUrl);
  }

  public isAuthEnabled(): boolean {
    return this.authEnabled;
  }

  // Get the one and only instance
  public static getInstance(): KeycloakUrls {
    if (!this._instance) {
      this._instance = new KeycloakUrls();
    }
    return this._instance;
  }

  // Return the keycloak client id used for the OAuth protocol
  public getClientId(): string {
    return this.clientId;
  }

  public getKeycloakURL(): string {
    return this.keycloakUrl;
  }

  public getHomePageUrl(): string {
    return this.uiUrl + "/" + HOME_PAGE;
  }

  public getErrorPageUrl(errorMsg: string): string {
    return this.uiUrl + "/" + ERROR_PAGE + "?" + errorMsg;
  }

  // Build the UI callback URL.  This has to match the callback configured in the webui keycloak client.
  // "http://localhost:8183/verrazzano/authcallback"
  public getCallbackUrl(): string {
    const url =  this.uiUrl + "/" ;//+ CALLBACK;
    return url;
  }

  // Build the auth endpoint URL.  For example:
  // https://keycloak.myvz.v8o.oracledx.com:443/auth/realms/verrazzano-system/protocol/openid-connect/auth
  public getAuthUrlPrefix(): string {
    const url = this.getUrlBase() + "auth";
    return url;
  }

  // Build the logout endpoint URL.  For example:
  // https://keycloak.myvz.v8o.oracledx.com:443/auth/realms/verrazzano-system/protocol/openid-connect/logout
  public getLogoutUrlPrefix(): string {
    return this.getProxyUrlBase() + "logout";
  }

  // Build the token endpoint URL.  For example:
  // https://keycloak.myvz.v8o.oracledx.com:443/auth/realms/verrazzano-system/protocol/openid-connect/token
  public getTokenUrlPrefix(): string {
    return this.getProxyUrlBase() + "token";
  }

  // Build the path section of the URL with a trailing slash
  private getUrlBase(): string {
    return this.keycloakUrl + "/auth/realms/" +  REALM  + "/protocol/openid-connect/"
  }

  // Build the proxy URL with a trailing slash
  private getProxyUrlBase(): string {
    return this.keycloakProxyUrl + "/auth/realms/" +  REALM  + "/protocol/openid-connect/"
  }
}


