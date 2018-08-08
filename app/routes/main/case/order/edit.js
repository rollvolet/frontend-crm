import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('order', params.order_id, {
      include: 'building,contact,vat-rate'
    });
  },
  afterModel(model) {
    const controller = this.controllerFor('main.case');
    controller.set('building', model.get('building'));
    controller.set('contact', model.get('contact'));
  }
});
