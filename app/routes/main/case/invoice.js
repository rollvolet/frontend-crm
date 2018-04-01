import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('invoice', params.invoice_id, {
      include: [
        'building',
        'contact',
        'vat-rate',
        'order',
        'supplements',
        'deposits',
        'deposit-invoices',
        'working-hours',
        'working-hours.employee'
      ].join(',')
    });
  },
  afterModel(model) {
    const controller = this.controllerFor('main.case');
    controller.set('building', model.get('building'));
    controller.set('contact', model.get('contact'));
  }
});
