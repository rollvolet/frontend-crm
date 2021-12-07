import Route from '@ember/routing/route';

export default class MainOrdersEditRoute extends Route {
  model(params) {
    return this.store.findRecord('order', params.order_id, {
      include: 'customer',
    });
  }

  async afterModel(model) {
    const customer = await model.customer;
    if (customer) {
      this.transitionTo('main.case.order.edit', customer, model);
    }
  }
}
