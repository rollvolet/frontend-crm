import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainOrdersEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('order', params.order_id, {
      include: 'customer',
    });
  }

  async afterModel(model) {
    const customer = await model.customer;
    if (customer) {
      this.router.transitionTo('main.case.order.edit', customer, model);
    }
  }
}
