import Route from '@ember/routing/route';

export default class EditRoute extends Route {
  model(params) {
    return this.store.loadRecord('request', params.request_id, {
      include: 'customer'
    });
  }

  async afterModel(model) {
    const customer = await model.customer;
    if (customer)
      this.transitionTo('main.case.request.edit', customer, model);
  }
}
