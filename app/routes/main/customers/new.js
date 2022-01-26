import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service configuration;
  @service store;
  @service router;

  model() {
    const customer = this.store.createRecord('customer', {
      isCompany: false,
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.configuration.defaultLanguage,
      country: this.configuration.defaultCountry,
    });

    return customer.save();
  }

  afterModel(model) {
    this.router.transitionTo('main.customers.edit', model);
  }
}
