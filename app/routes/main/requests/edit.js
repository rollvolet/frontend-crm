import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('request', params.request_id, {
      include: 'customer',
    });
  }

  async afterModel(model) {
    const customer = await model.customer;
    if (customer) {
      this.router.transitionTo('main.case.request.edit', customer, model);
    }
  }
}
