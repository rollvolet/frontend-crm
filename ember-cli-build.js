'use strict';
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    postcssOptions: {
      compile: {
        enabled: true,
        extension: 'scss',
        parser: require('postcss-scss'),
        plugins: [
          require('@csstools/postcss-sass'),
          require('tailwindcss')('./app/styles/tailwind.config.js')
        ]
      }
    },
    flatpickr: {
      locales: ['nl'],
      theme: 'material_red'
    }
  });

  return app.toTree();
};
