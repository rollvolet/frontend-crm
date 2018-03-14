import { debug, warn } from '@ember/debug';
import { Promise, resolve } from 'rsvp';
import { run, later, cancel } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import { inject } from '@ember/service';
import ToriiAuthenticator from 'ember-simple-auth/authenticators/torii';

/**
 * Azure AD OAuth2 authenticator that supports automatic token refresh.
 *
 * Inspired by the JWT authenticator of ember-simple-auth-token
*/
export default ToriiAuthenticator.extend({
  torii: inject(),
  ajax: inject(),

  tokenEndpoint: 'authentication/token',
  refreshTokenEndpoint: 'authentication/refresh-token',
  refreshLeeway: 60, // in seconds
  refreshTokenTimeout: null,

  toriiProvider: 'azure-oauth2',

  authenticate() {
    return this._super(...arguments) // get authorization code through Torii
      .then((data) => this.getTokenByAuthorizationCode(data)); // exchange authorization code for access token/refresh token
  },

  invalidate() {
    return this._super(...arguments)
      .then(() => {
        cancel(this.refreshTokenTimeout);
        delete this.refreshTokenTimeout;
        return new resolve();
      });
  },

  restore() {
    return this._super(...arguments)
      .then((data) => {
        const expiresAt = data.expiresAt;
        const refreshToken = data.refresh_token;
        this.scheduleAccessTokenRefresh(expiresAt, refreshToken);

        if (!this.get('refreshTokenTimeout')) {
          // no refresh token task scheduled in the future
          // attempt to refresh the token now
          // if the server rejects the token the user session will be invalidated
          return new resolve(this.refreshAccessToken(refreshToken));
        } else {
          return new resolve(data);
        }
      });
  },

  getTokenByAuthorizationCode(data) {
    return this.get('ajax').request(this.get('tokenEndpoint'), {
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        authorizationCode: data.authorizationCode,
        redirectUri: data.redirectUri
      })
    }).then( (response) => {
      return this.handleAuthResponse(response);
    });
  },

  handleAuthResponse(response) {
    const expiresAt = response.expires_on;
    const refreshToken = response.refresh_token;
    this.scheduleAccessTokenRefresh(expiresAt, refreshToken);

    const accessToken = response.access_token;
    const tokenData = this.decodeToken(accessToken);
    return {
      provider: this.get('toriiProvider'), // required to make session restore work
      'access_token': accessToken,
      'refresh_token': refreshToken,
      expiresAt: expiresAt,
      user: {
        account: tokenData.unique_name,
        givenName: tokenData.given_name,
        familyName: tokenData.family_name
      }
    };
  },

  scheduleAccessTokenRefresh(expiresAt, refreshToken) {
    const now = this.getCurrentTime();
    const wait = (expiresAt - now - this.get('refreshLeeway')) * 1000;

    if (!isEmpty(refreshToken) && !isEmpty(expiresAt) && wait > 0) {
      cancel(this.refreshTokenTimeout);
      delete this.refreshTokenTimeout;
      debug(`Refresh token task scheduled in ${wait/1000} seconds at ${new Date(Date.now() + wait)}`);
      this.refreshTokenTimeout = later(this, this.refreshAccessToken, refreshToken, wait);
    }
  },

  refreshAccessToken(refreshToken) {
    debug(`Attempt to refresh access token at ${new Date()}`);
    return new Promise( (resolve, reject) => {
      this.get('ajax').request(this.get('refreshTokenEndpoint'), {
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          refreshtoken: refreshToken
        })
      }).then( (response) => {
        run(() => {
          try {
            const sessionData = this.handleAuthResponse(response);
            this.trigger('sessionDataUpdated', sessionData);
            resolve(sessionData);
          } catch (error) {
            reject(error);
          }
        }), (xhr, status, error) => {
          warn(`Failed to refresh access token. Server responded with [${xhr.status}] ${error}`);

          if (xhr.status === 401 || xhr.status === 403) {
            this.invalidate().then(() => {
              this.trigger('sessionDataInvalidated');
            });
          }

          reject();
        };
      });
    });
  },

  getCurrentTime() {
    return Math.floor((new Date()).getTime() / 1000);
  },

  decodeToken(jwtToken) {
    const payload = jwtToken.split('.')[1];
    const tokenData = decodeURIComponent(window.escape(atob(payload)));

    try {
      return JSON.parse(tokenData);
    } catch (e) {
      return tokenData;
    }
  }
});
