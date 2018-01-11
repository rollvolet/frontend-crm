import { inject } from '@ember/service';
import ToriiAuthenticator from 'ember-simple-auth/authenticators/torii';
import config from '../config/environment';

export default ToriiAuthenticator.extend({
  torii: inject(),
  ajax: inject(),
  authenticate() {
    const ajax = this.get('ajax');
    const tokenExchangeUri = config.torii.providers['azure-oauth2'].tokenExchangeUri;

    return this._super(...arguments).then((data) => {
      return ajax.request(tokenExchangeUri, {
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          authorizationCode: data.authorizationCode,
          redirectUri: data.redirectUri
        })
      }).then( (response) => {
        return {
          provider: data.provider, // required to make session restore work
          'access_token': response.accessToken,
          user: {
            account: response.userInfo.displayableId,
            givenName: response.userInfo.givenName,
            familyName: response.userInfo.familyName
          }
        };
      });
    });
  }
});
