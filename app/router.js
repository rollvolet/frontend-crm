import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('main', { path: '/' }, function() {
    this.route('customers', function() {
      this.route('edit', { path: '/:customer_id' });
    });
    this.route('requests', function() {});
  });
});

export default Router;
