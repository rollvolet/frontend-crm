'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'rollvolet-crm',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    moment: {
      includeLocales: ['nl'],
      outputFormat: 'DD-MM-YYYY hh:mm:ss',
      allowEmpty: true
    },
    torii: {
      disableRedirectInitializer: true,
      providers: {
        'azure-ad2-oauth2': {
          tenantId: '3e9b8827-39f2-4fb4-9bc1-f8a200aaea79',
          apiKey: '73f6618e-be24-4ab5-a1da-4f368448fd96',
          // scope 'access_as_user' is used for the on-behalf-of authentication flow in the backend
          // scope  'offline_access' is required to get a refresh token together with the access token
          scope: 'api://73f6618e-be24-4ab5-a1da-4f368448fd96/access_as_user offline_access',
          redirectUri: 'http://localhost:4200/torii/redirect.html'
        }
      }
    },
    'ember-paper': {
      'paper-toaster': {
        position: 'bottom left',
        duration: 5000
      }
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // acceptance env
    // ENV.torii.providers['azure-ad2-oauth2'].apiKey = '552ea087-fcd9-4d53-911b-19b11ff6631a';
    // ENV.torii.providers['azure-ad2-oauth2'].scope = 'api://552ea087-fcd9-4d53-911b-19b11ff6631a/access_as_user offline_access',
    // ENV.torii.providers['azure-ad2-oauth2'].redirectUri = 'https://crm.rollvolet.info/torii/redirect.html';

    // production env
    // ENV.torii.providers['azure-ad2-oauth2'].apiKey = '2336e897-d594-47ad-b2a3-bb3f0973e60a';
    // ENV.torii.providers['azure-ad2-oauth2'].scope = 'api://2336e897-d594-47ad-b2a3-bb3f0973e60a/access_as_user offline_access',
    // ENV.torii.providers['azure-ad2-oauth2'].redirectUri = 'https://rkb.rollvolet.be/torii/redirect.html';

    ENV.torii.providers['azure-ad2-oauth2'].apiKey = '{{OAUTH_API_KEY}}';
    ENV.torii.providers['azure-ad2-oauth2'].scope = '{{OAUTH_SCOPE}}';
    ENV.torii.providers['azure-ad2-oauth2'].redirectUri = '{{OAUTH_REDIRECT_URI}}';
  }

  return ENV;
};
