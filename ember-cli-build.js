'use strict';
// Credits to the following posts that helps me to reduce build times drastically

// https://discuss.emberjs.com/t/tips-for-improving-build-time-of-large-apps/15008/12
// https://www.gokatz.me/blog/how-we-cut-down-our-ember-build-time/


//ember-cli-build.js
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

let env = EmberApp.env(),
  IS_PROD = env === 'production',
  IS_TEST = env === 'test' ;

const nodeSass = require('node-sass');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    // hinting: IS_TEST, // Disable linting for all builds but test
    tests: IS_TEST, // Don't even generate test files unless a test build
    "ember-cli-babel": {
      includePolyfill: IS_PROD // Only include babel polyfill in prod
    },
    autoprefixer: {
      sourcemap: false // Was never helpful
    },
    sourcemaps: {
      // enabled: IS_PROD // CMD ALT F in chrome is *almost* as fast as CMD P
    },
    fingerprint: {
      enabled: IS_PROD //Asset rewrite will takes more time and fingerprinting can be omitted in development
    },
    sassOptions: {
      // moving from compass compiler to node gave huge improvement
      implementation: nodeSass, //implementation here is node-sass,
      sourceMap : false //will debug with generated CSS than sourcemap :)
    }
  });

  // Only import other polyfills in production
  if (IS_PROD) {
    app.import('vendor/ie-polyfill.js');
  }

  return app.toTree();
};
