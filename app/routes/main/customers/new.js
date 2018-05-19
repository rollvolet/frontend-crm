import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  configuration: service(),
  model() {
    const customer = this.store.createRecord('customer', {
      isCompany: false,
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.configuration.defaultLanguage(),
      country: this.configuration.defaultCountry()
    });

    return customer.save();
  }
});
