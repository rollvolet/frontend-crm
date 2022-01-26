import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainInterventionsEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('intervention', params.intervention_id, {
      include: 'customer',
    });
  }

  async afterModel(model) {
    const customer = await model.customer;
    if (customer) {
      this.router.transitionTo('main.case.intervention.edit', customer, model);
    }
  }
}
