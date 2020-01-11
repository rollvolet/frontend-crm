import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class EditRoute extends Route {
  model(params) {
    return this.store.findRecord('request', params.request_id);
  }

  async afterModel(model) {
    const customer = await model.customer;
    if (customer)
      this.transitionTo('main.case.request.edit', customer, model);
  }
}
