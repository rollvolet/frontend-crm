import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainCustomersEditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('customer', params.customer_id, {
      include: [
        'language',
        'address.country',
        'telephones.telephone-type',
        'telephones.country',
        'emails',
      ].join(','),
    });
  }
}
