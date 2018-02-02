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
        // e.g. 'with-controller': true
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
        'azure-oauth2': {
          apiKey: 'de1c3029-8d4c-46ab-b3a7-717cac926280',
          redirectUri: 'http://localhost:4200/torii/redirect.html',
          state: "STATE",
          tokenExchangeUri: 'authentication/token'
        }
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
    ENV.torii.providers['azure-oauth2'].apiKey = 'bd3082cc-72b4-4daf-bf00-fe35e5b8245a';
    ENV.torii.providers['azure-oauth2'].redirectUri = 'https://rollvolet-crm.moof-it.be/torii/redirect.html';
    // here you can enable a production-specific feature
  }

  return ENV;
};
