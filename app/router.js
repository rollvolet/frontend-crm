import EmberRouter from '@ember/routing/router';
import config from 'rollvolet-crm/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('index');
  this.route('login');
  this.route('mock-login');
  this.route('oops');
  this.route('forbidden');
  this.route('main', { path: '/' }, function () {
    this.route('customers', function () {
      this.route('new');
      this.route('edit', { path: '/:customer_id' }, function () {
        this.route('request'); // create a new request with accompanying case
        this.route('intervention'); // create a new intervention with accompanying case
        this.route('invoice'); // create a new isolated invoice with accompanying case
        this.route('merge', function () {
          this.route('edit', { path: '/:other_customer_id' });
        });
      });
    });
    this.route('requests', function () {
      this.route('new'); // create a new request without customer
      this.route('edit', { path: '/:request_id' }); // shortcut for main.case.request.edit.index
    });
    this.route('interventions', function () {
      this.route('new'); // create a new intervention without customer
      this.route('edit', { path: '/:intervention_id' }); // shortcut for main.case.intervention.edit.index
    });
    this.route('offers', function () {
      this.route('edit', { path: '/:offer_id' }); // shortcut for main.case.offer.edit.index
    });
    this.route('orders', function () {
      this.route('edit', { path: '/:order_id' }); // shortcut for main.case.order.edit.index
    });
    this.route('deposit-invoices', function () {
      this.route('edit', { path: '/:deposit_invoice_id' }); // shortcut for main.case.order.edit.deposit-invoices
    });
    this.route('invoices', function () {
      this.route('edit', { path: '/:invoice_id' }); // shortcut for main.case.invoice.edit.index
    });
    this.route('legacy-case', { path: '/legacy-case/:customer_id' }); // redirect route for legacy SQL IDs
    this.route('case', { path: '/case/:case_id' }, function () {
      this.route('request', function () {
        this.route('edit', { path: '/:request_id' }, function () {
          this.route('customer'); // link a customer
          this.route('offer'); // create new offer
        });
      });
      this.route('intervention', function () {
        this.route('edit', { path: '/:intervention_id' }, function () {
          this.route('customer'); // link a customer
          this.route('invoice'); // create new invoice for intervention
        });
      });
      this.route('offer', function () {
        this.route('edit', { path: '/:offer_id' }, function () {
          this.route('order'); // create new order
        });
      });
      this.route('order', function () {
        this.route('edit', { path: '/:order_id' }, function () {
          this.route('deposit-invoices');
          this.route('invoice'); // create new invoice for order
        });
      });
      this.route('invoice', function () {
        this.route('edit', { path: '/:invoice_id' }, function () {});
      });
    });

    this.route('accountancy', function () {
      this.route('exports', function () {});
    });

    this.route('reports', function () {
      this.route('revenue');
      this.route('outstanding-jobs', function () {});
    });

    this.route('users', function () {});
  });
});
