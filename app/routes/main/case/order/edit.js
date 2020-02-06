import Route from '@ember/routing/route';

export default class EditRoute extends Route {
  model(params) {
    return this.store.loadRecord('order', params.order_id, {
      include: [
        'building',
        'contact',
        'vat-rate'
      ].join(',')
    });
  }

  // afterModel(model) {
  //   const controller = this.controllerFor('main.case');
  //   controller.set('building', model.get('building'));
  //   controller.set('contact', model.get('contact'));
  // }
}
