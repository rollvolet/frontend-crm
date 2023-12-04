import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainCustomersCustomerMergeEditRoute extends Route {
  @service store;

  async model(params) {
    const left = this.modelFor('main.customers.edit');
    const right = await this.store.findRecord('customer', params.other_customer_id, {
      include: [
        'language',
        'address.country',
        'telephones.telephone-type',
        'telephones.country',
        'emails',
      ].join(','),
    });

    return { left, right };
  }
}
