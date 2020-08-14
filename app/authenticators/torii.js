import { inject as service } from '@ember/service';
import ToriiAuthenticator from 'ember-simple-auth/authenticators/torii';
import { debug, warn } from '@ember/debug';
import fetch, { Headers } from 'fetch';
import { run, later, cancel } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import config from '../config/environment';
import decodeAuthToken from '../utils/decode-auth-token';

const toriiProvider = 'azure-ad2-oauth2';

/**
 * Azure AD 2.0 OAuth2 authenticator that supports automatic token refresh.
 *
 * Inspired by the JWT authenticator of ember-simple-auth-token
*/
export default class Torii extends ToriiAuthenticator {
  @service torii

  async authenticate() {
    const data = await super.authenticate(...arguments); // get authorization code through Torii

    // exchange authorization code for access token/refresh token
    const result = await fetch('/api/sessions', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        'authorization-code': data.authorizationCode,
        'redirect-uri': data.redirectUri,
        scope: config.torii.providers['azure-ad2-oauth2'].scope
      })
    });

    if (result.ok) {
      const response = await result.json();
      return {
        provider: toriiProvider, // required to make session restore work
        user: response
      };
    } else {
      throw result;
    }
  }

  async invalidate() {
    const response = await super.invalidate(...arguments);
    await fetch('/api/sessions/current', {
      method: 'DELETE',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
    return response;
  }

  async restore() {
    await super.restore(...arguments);
    const result = await fetch('/api/sessions/current', {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });

    if (result.ok) {
      const response = await result.json();
      return {
        provider: toriiProvider, // required to make session restore work
        user: response
      };
    } else {
      throw result;
    }
  }
}
