import { KeycloakJwt } from 'vz-console/auth/KeycloakJwt';
import { AuthStorage } from 'vz-console/auth/AuthStorage';
import * as sinon from 'sinon';

const expect = chai.expect;
const stubAccTokenExpiry = sinon.stub(AuthStorage, 'getAccessTokenExpiryTsMillis');
const stubRefreshTokenExpiry = sinon.stub(AuthStorage, 'getRefreshTokenExpiryTsMillis');
const past = Date.now() - 200;
// Timestamp one hour into the future
const future = Date.now() + 60*60*1000;

describe('isAccessTokenExpired', () => {
    it('Access Token expired in the past', () => {
        // Use a timestamp 200 ms in the past
        stubAccTokenExpiry.returns(past);
        expect(KeycloakJwt.isAccessTokenExpired()).to.equal(true);
    });
    it('Access Token expires in the future', () => {
        stubAccTokenExpiry.returns(future);
        expect(KeycloakJwt.isAccessTokenExpired()).to.equal(false);
    });
});

describe('isRefreshTokenExpired', () => {
    it('Refresh Token expired in the past', () => {
        stubRefreshTokenExpiry.returns(past);
        expect(KeycloakJwt.isRefreshTokenExpired()).to.equal(true);
    });
    it('Refresh Token expires in the future', () => {
        stubRefreshTokenExpiry.returns(future);
        expect(KeycloakJwt.isRefreshTokenExpired()).to.equal(false);
    });
});