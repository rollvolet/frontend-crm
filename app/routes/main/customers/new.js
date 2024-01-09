import Route from '@ember/routing/route';
import { service } from '@ember/service';
import constants from '../../../config/constants';

const { CUSTOMER_TYPES } = constants;

export default class NewRoute extends Route {
  @service codelist;
  @service sequence;
  @service store;
  @service router;

  async model() {
    const address = this.store.createRecord('address', {
      country: this.codelist.defaultCountry,
    });
    const [number] = await Promise.all([this.sequence.fetchNextCustomerNumber(), address.save()]);
    const customer = this.store.createRecord('customer', {
      type: CUSTOMER_TYPES.INDIVIDUAL,
      number,
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.codelist.defaultLanguage,
      address,
    });

    return customer.save();
  }

  afterModel(model) {
    this.router.transitionTo('main.customers.edit.index', model);
  }
}
