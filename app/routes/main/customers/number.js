import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainCustomersNumberRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.queryOne('customer', {
      'filter[:exact:number]': params.customer_number,
    });
  }

  afterModel(model) {
    this.router.transitionTo('main.customers.edit.index', model.id);
  }
}
