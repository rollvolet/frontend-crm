import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('invoice', params.invoice_id, {
      include: [
        'building',
        'contact',
        'supplements'
      ].join(',')
    });
  },
  afterModel(model) {
    const controller = this.controllerFor('main.case');
    controller.set('building', model.get('building'));
    controller.set('contact', model.get('contact'));
  }
});
