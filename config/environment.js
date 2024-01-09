'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'rollvolet-crm',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    moment: {
      includeLocales: ['nl'],
      outputFormat: 'DD-MM-YYYY HH:mm:ss',
      allowEmpty: true,
    },
    torii: {
      disableRedirectInitializer: true,
      providers: {
        'azure-ad2-oauth2': {
          tenantId: '3e9b8827-39f2-4fb4-9bc1-f8a200aaea79',
          apiKey: '73f6618e-be24-4ab5-a1da-4f368448fd96',
          // scope  'offline_access' is required to get a refresh token together with the access token
          scope: 'offline_access User.Read Calendars.ReadWrite.Shared Files.ReadWrite.All',
          redirectUri: 'http://localhost:4200/torii/redirect.html',
        },
      },
    },
    emberKeyboard: {
      disableInputsInitializer: true,
      propagation: true,
    },
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
    ENV.torii.providers['azure-ad2-oauth2'].apiKey = '{{AUTH_CLIENT_ID}}';
    ENV.torii.providers['azure-ad2-oauth2'].redirectUri = '{{AUTH_REDIRECT_URI}}';
  }

  return ENV;
};
