'use strict';

module.exports = {
  extends: 'octane',
  rules: {
    'no-triple-curlies': false,
    'no-curly-component-invocation': {
      allow: [
        'app-version'
      ]
    }
  }
};
