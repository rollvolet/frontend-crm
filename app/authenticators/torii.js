import ToriiAuthenticator from 'ember-simple-auth/authenticators/torii';
import { debug, warn } from '@ember/debug';
import fetch, { Headers } from 'fetch';
import { Promise, resolve } from 'rsvp';
import { run, later, cancel } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import { inject } from '@ember/service';
import config from '../config/environment';
import decodeAuthToken from '../utils/decode-auth-token';

/**
 * Azure AD 2.0 OAuth2 authenticator that supports automatic token refresh.
 *
 * Inspired by the JWT authenticator of ember-simple-auth-token
*/
export default ToriiAuthenticator.extend({
  torii: inject(),

  tokenEndpoint: '/api/authentication/token',
  refreshTokenEndpoint: '/api/authentication/refresh-token',
  refreshLeeway: 60, // in seconds
  refreshTokenTimeout: null,

  toriiProvider: 'azure-ad2-oauth2',

  async authenticate() {
    const data = await this._super(...arguments); // get authorization code through Torii

    // exchange authorization code for access token/refresh token
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        authorizationCode: data.authorizationCode,
        redirectUri: data.redirectUri,
        scope: config.torii.providers['azure-ad2-oauth2'].scope
      })
    });

    if (response.ok) {
      const responseBody = await response.json();
      return this.handleAuthResponse(responseBody);
    } else {
      throw response;
    }

  },

  async invalidate() {
    const response = await this._super(...arguments);
    cancel(this.refreshTokenTimeout);
    delete this.refreshTokenTimeout;
    return response;
  },

  async restore() {
    const data = await this._super(...arguments);
    const refreshToken = data.refresh_token;

    if (!this.refreshTokenTimeout) {
      // No refresh token task scheduled in the future. Attempt to refresh the token now.
      // If the server rejects the token the user session will be invalidated
      return this.refreshAccessToken(refreshToken);
    } else {
      this.scheduleAccessTokenRefresh(data);
      return data;
    }
  },

  async refreshAccessToken(refreshToken) {
    debug(`Attempt to refresh access token at ${new Date()}`);

    const response = await fetch(this.refreshTokenEndpoint, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        refreshToken: refreshToken,
        redirectUri: config.torii.providers['azure-ad2-oauth2'].redirectUri,
        scope: config.torii.providers['azure-ad2-oauth2'].scope
      })
    });

    if (response.ok) {
      const responseBody = await response.json();
      const sessionData = this.handleAuthResponse(responseBody);
      run(async () => {
        try {
          this.trigger('sessionDataUpdated', sessionData);
        } catch (error) {
          warn(`Failed to update session data after access token refresh: ${error}`, { id: 'refresh-token.data-update-failure' });
          await this.invalidate();
          this.trigger('sessionDataInvalidated');
        }
      });
      return sessionData;
    } else {
      throw response;
    }
  },

  handleAuthResponse(response) {
    const expiresAt = this.scheduleAccessTokenRefresh(response);

    const accessToken = response.access_token;
    const jwt = decodeAuthToken(accessToken);
    return {
      provider: this.toriiProvider, // required to make session restore work
      'access_token': accessToken,
      'refresh_token': response.refresh_token,
      'expires_at': expiresAt,
      user: {
        account: jwt.preferred_username,
        name: jwt.name
      }
    };
  },

  scheduleAccessTokenRefresh({ expires_in, expires_at, refresh_token }) {
    if (expires_in) {
      expires_at = (Date.now() + expires_in * 1000) / 1000;
    }
    const now = Math.floor((new Date()).getTime() / 1000); // current time
    const wait = (expires_at - now - this.refreshLeeway) * 1000;

    if (!isEmpty(refresh_token) && !isEmpty(expires_at) && wait > 0) {
      cancel(this.refreshTokenTimeout);
      delete this.refreshTokenTimeout;
      debug(`Refresh token task scheduled in ${wait/1000} seconds at ${new Date(Date.now() + wait)}`);
      this.refreshTokenTimeout = later(this, this.refreshAccessToken, refresh_token, wait);
    }

    return expires_at;
  }
});
