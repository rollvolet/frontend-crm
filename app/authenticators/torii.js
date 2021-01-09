import { inject as service } from '@ember/service';
import ToriiAuthenticator from 'ember-simple-auth/authenticators/torii';
import fetch, { Headers } from 'fetch';

const toriiProvider = 'azure-ad2-oauth2';

/**
 * Azure AD 2.0 OAuth2 authenticator
*/
export default class Torii extends ToriiAuthenticator {
  @service torii

  async authenticate() {
    // get authorization code through Torii
    const data = await super.authenticate(...arguments);

    // exchange authorization code for access token in backend
    const result = await fetch('/sessions', {
      method: 'POST',
      headers: new Headers({
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }),
      body: JSON.stringify({
        authorizationCode: data.authorizationCode
      })
    });

    if (result.ok) {
      const response = await result.json();
      response.provider = toriiProvider; // required to make session restore work
      return response;
    } else {
      throw result;
    }
  }

  async invalidate() {
    const response = await super.invalidate(...arguments);
    await fetch('/sessions/current', {
      method: 'DELETE',
      headers: new Headers({
        Accept: 'application/vnd.api+json'
      })
    });
    return response;
  }

  async restore() {
    await super.restore(...arguments);
    const result = await fetch(`/sessions/current`, {
      method: 'GET',
      headers: new Headers({
        Accept: 'application/vnd.api+json'
      })
    });

    if (result.ok) {
      const response = await result.json();
      response.provider = toriiProvider; // required to make session restore work
      return response;
    } else {
      throw result;
    }
  }
}
