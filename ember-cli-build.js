'use strict';
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    flatpickr: {
      locales: ['nl'],
      theme: 'material_red',
    },
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
    svgJar: {
      sourceDirs: ['public', 'node_modules/remixicon/icons'],
    },
  });

  return app.toTree();
};
