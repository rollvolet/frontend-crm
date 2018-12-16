import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('request', params.request_id);
  },
  async afterModel(model) {
    const customer = await model.customer;
    if (customer)
      this.transitionTo('main.case.request.edit', customer, model);
  }
});
