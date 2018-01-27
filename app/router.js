import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login');
  this.route('main', { path: '/' }, function() {
    this.route('customers', function() {
      this.route('edit', { path: '/:customer_id' });
    });
    this.route('requests', function() {});
    this.route('offers', function() {});
    this.route('case', { path: '/case/:customer_id' }, function() {
      this.route('request', { path: '/request/:request_id' });
      this.route('offer', { path: '/offer/:offer_id' });
      this.route('order');
      this.route('invoice');
    });
  });
});

export default Router;
