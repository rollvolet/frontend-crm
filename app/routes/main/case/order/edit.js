import Route from '@ember/routing/route';

export default class EditRoute extends Route {
  model(params) {
    return this.store.findRecord('order', params.order_id, {
      include: 'vat-rate',
    });
  }
}
