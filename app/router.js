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
      this.route('new');
    });
    this.route('requests', function() {});
    this.route('offers', function() {});
    this.route('orders', function() {});
    this.route('deposit-invoices', function() {});
    this.route('invoices', function() {});
    this.route('case', { path: '/case/:customer_id' }, function() {
      this.route('request', function() {
        this.route('new');
        this.route('edit', { path: '/:request_id' }, function() {
          this.route('offer'); // create new offer
        });
      });
      this.route('offer', function() {
        this.route('edit', { path: '/:offer_id' }, function() {
          this.route('order'); // create new order
        });
      });
      this.route('order', function() {
        this.route('edit', { path: '/:order_id' }, function() {
          this.route('deposit-invoices');
          this.route('invoice'); // create new invoice
        });
      });
      this.route('invoice', function() {
        this.route('edit', { path: '/:invoice_id' }, function() {});
      });
    });
  });
});

export default Router;
