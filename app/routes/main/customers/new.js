import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

@classic
export default class NewRoute extends Route {
  @service
  configuration;

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

  afterModel(model) {
    this.transitionTo('main.customers.edit', model, {
      queryParams: { editMode: true }
    });
  }
}
