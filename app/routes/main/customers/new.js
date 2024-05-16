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
    const profile = this.store.createRecord('customer-profile', {
      invoicePaymentPeriod: 14,
      depositRequired: true,
      vatRate: this.codelist.defaultVatRate,
      deliveryMethod: this.codelist.defaultDeliveryMethod,
    });
    const [number] = await Promise.all([
      this.sequence.fetchNextCustomerNumber(),
      address.save(),
      profile.save(),
    ]);
    const customer = this.store.createRecord('customer', {
      type: CUSTOMER_TYPES.INDIVIDUAL,
      number,
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.codelist.defaultLanguage,
      address,
      profile,
    });

    return customer.save();
  }

  afterModel(model) {
    this.router.transitionTo('main.customers.edit.index', model);
  }
}
