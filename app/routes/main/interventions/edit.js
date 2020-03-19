import Route from '@ember/routing/route';

export default class MainInterventionsEditRoute extends Route {
  model(params) {
    return this.store.loadRecord('intervention', params.intervention_id, {
      include: 'customer'
    });
  }

  async afterModel(model) {
    const customer = await model.customer;
    if (customer)
      this.transitionTo('main.case.intervention.edit', customer, model);
  }
}
