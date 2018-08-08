import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const order = this.modelFor('main.case.order.edit');
    return order.query('depositInvoices', {
      sort: '-number',
      page: {
        size: 1000 // we don't expect more than 1000 deposit invoices for 1 order
      },
      include: 'building,contact,vat-rate'
    });
  },
  setupController(controller) {
    const customer = this.modelFor('main.case');
    const order = this.modelFor('main.case.order.edit');
    controller.set('customer', customer);
    controller.set('order', order);
  }
});
