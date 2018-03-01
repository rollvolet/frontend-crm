import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const order = this.modelFor('main.case.order');
    return order.query('depositInvoices', {
      sort: '-number',
      page: {
        size: 1000 // we don't expect more than 1000 deposit invoices for 1 order
      },
      include: 'building,contact,vat-rate'
    });
  }
});
