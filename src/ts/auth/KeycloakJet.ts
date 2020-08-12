// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as OjModel from 'ojs/ojmodel';
import { Keycloak } from './Keycloak';
import { AuthStorage } from './AuthStorage';
import { KeycloakUrls } from './KeycloakUrls';

/**
 * Class KeycloakJet provides Oracle JET oauth integration with Keycloak
 */
export class KeycloakJet {
    jetOauth: OjModel.OAuth
    keycloak: Keycloak
    constructor() {
        this.keycloak = new Keycloak();
        this.jetOauth = new OjModel.OAuth({}, 'Authorization');
        this.initAuth().then(() => console.log('VZ - KeycloakJet auth initialized'));
    }

    async initAuth(): Promise<void> {
        // Only use keycloak if URL defined, otherwise this is dev testing mode
        if (!KeycloakUrls.getInstance().isAuthEnabled()) {
            return;
        }

        // If the access token doesn't exist, we need to login, OR finish the login
        // steps when keycloak is calling back to this code.
        if (!AuthStorage.accessTokenExists()) {
            console.log("Access token does not exist in storage");
            // If this is not the callback from keycloak then the user needs to be authenticated
            if (!Keycloak.isReturnFromKeycloakLogin()) {
                console.log('VZ - KeycloakJet: logging in via keycloak');
                // Send the auth GET request to keycloak to authenticate the user
                // This will result in the keycloak login page being displayed if
                // the user session doesn't exist.
                this.keycloak.sendAuthRequest();
            } else {
                console.log('VZ - KeycloakJet returning from keycloak, getting acess token');
                // This is the keycloak callback, get the tokens and save them.
                await Keycloak.fetchToken();
            }
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