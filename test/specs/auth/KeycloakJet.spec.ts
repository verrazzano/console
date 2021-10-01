// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { AuthStorage } from "vz-console/auth/AuthStorage";
import * as sinon from "sinon";
import {
  KeycloakJet,
  Keycloak,
  KeycloakUrls,
  KeycloakJwt,
} from "vz-console/auth/loader";

const expect = chai.expect;
const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

const stubWindowFetch = sinon.stub(window, "fetch");
describe("initAuth tests", () => {
  const stubAccessTokenExists = sinon.stub(AuthStorage, "accessTokenExists");
  const stubIsReturnFromKeycloak = sinon.stub(
    Keycloak,
    "isReturnFromKeycloakLogin"
  );
  const stubLocationReplace = sinon
    .stub(Keycloak, "replaceWindowLocation")
    .callsFake((loc) => {
      console.log("Fake replaceWindowLocation called with " + loc);
    });

  // Stub out keycloak URL and client id values
  const keycloakUrls = KeycloakUrls.getInstance();
  sinon
    .stub(keycloakUrls, "getAuthUrlPrefix")
    .returns("https://fakeKeycloakUrl");
  sinon.stub(keycloakUrls, "getClientId").returns("fakeClientId");
  sinon.stub(keycloakUrls, "getCallbackUrl").returns("https://fakeCallbackUrl");

  it("does not call Keycloak if access token exists", async () => {
    stubAccessTokenExists.returns(true);
    stubIsReturnFromKeycloak.returns(false);

    console.log("calling initauth on Keycloak");
    await KeycloakJet.getInstance().initAuth();

    expect(stubAccessTokenExists.callCount).to.gte(1);
    await delay(2000); // Wait 2 seconds - there doesn't seem to be a cleaner way to do the wait for the redirect call, which returns a Promise that never resolves
    expect(stubLocationReplace.notCalled).true;
  });
  it("calls keycloak when no access token", async () => {
    stubAccessTokenExists.returns(false);
    stubIsReturnFromKeycloak.returns(false);
    sinon.stub(Keycloak, "getAuthCode").returns("fakeAuthCode");

    console.log("calling initauth on Keycloak");
    await KeycloakJet.getInstance().initAuth();

    expect(stubAccessTokenExists.callCount).to.gte(1);
    expect(stubIsReturnFromKeycloak.callCount).to.gte(1);
    await delay(2000); // Wait 2 seconds - there doesn't seem to be a cleaner way to do the wait for the redirect call, which returns a Promise that never resolves
    console.log(
      `location replace called ${stubLocationReplace.callCount} times`
    );
    expect(stubLocationReplace.callCount).to.gte(1);
    const actualRedirectLocation = stubLocationReplace.args[
      stubLocationReplace.callCount - 1
    ][0] as string;
    expect(actualRedirectLocation).to.satisfy(
      (loc) =>
        loc.startsWith("https://fakeKeycloakUrl") &&
        loc.includes("client_id=fakeClientId"),
      "Redirect URL has wrong URI or client id!"
    );
  });
  it("fetches and stores token when returning from Keycloak", async () => {
    stubAccessTokenExists.returns(false);
    stubIsReturnFromKeycloak.returns(true);
    const spyStoreToken = sinon.spy(AuthStorage, "storeIdAndTokens");
    sinon
      .stub(KeycloakJwt, "calcExpiryTsMillis")
      .returns(Date.now() + 60 * 60 * 1000);

    const fakeTokenResponse = {
      status: 200,
      json: async () => {
        return Promise.resolve({
          access_token: "myaccesstoken",
          refresh_token: "myrefreshtoken",
        });
      },
    } as Response;

    stubWindowFetch.callsFake((req) => Promise.resolve(fakeTokenResponse));
    KeycloakJet.getInstance().initAuth();
    await delay(2000); // Wait 2 seconds - there doesn't seem to be a cleaner way to do the wait for the redirect call, which returns a Promise that never resolves
    expect(AuthStorage.getAccessToken()).to.equal("myaccesstoken");
    expect(AuthStorage.getRefreshToken()).to.equal("myrefreshtoken");
  });
});

describe("authenticatedFetch", () => {
  it("adds bearer token", async () => {
    stubWindowFetch.callsFake((req) => Promise.resolve(null));
    const stubAccessTokenExists = sinon
      .stub(KeycloakJwt, "isAccessTokenExpired")
      .returns(false);
    sinon.stub(AuthStorage, "getAccessToken").returns("fakeAccessTokenHere");

    const authenticatedFetchApi = KeycloakJet.getInstance().getAuthenticatedFetchApi();
    await authenticatedFetchApi("https://someurl");
    expect(stubWindowFetch.callCount).to.gte(1);
    // Get argument from most recent call to the window.fetch stub
    const req = stubWindowFetch.args[
      stubWindowFetch.callCount - 1
    ][0] as Request;
    expect(req).ok; // req is not null/undefined
    expect(req.headers.get("Authorization")).to.equal(
      "Bearer fakeAccessTokenHere"
    );
  });
});
