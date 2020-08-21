import { KeycloakJwt } from 'auth/KeycloakJwt';
import { AuthStorage } from 'auth/AuthStorage';

describe('isAccessTokenExpired', () => {
    const expect = chai.expect;
    it('actually testing it', () => {
        console.log('testing hello');
        expect('hello').to.equal('hello');
    });
    /*it('Expired in the past', () => {
        // Use a timestamp 200 ms in the past
        const past = Date.now() - 200;
        spyOn(AuthStorage, 'getAccessTokenExpiryTsMillis').and.returnValue(past);
        expect(KeycloakJwt.isAccessTokenExpired()).toEqual(true);
    });
    it('Expires in the future', () => {
        // Use a timestamp one hour into the future
        const future = Date.now() + 60*60*1000;
        spyOn(AuthStorage, 'getAccessTokenExpiryTsMillis').and.returnValue(future);
        expect(KeycloakJwt.isAccessTokenExpired()).toEqual(false);
    });*/
});