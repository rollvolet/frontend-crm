import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const defaultLanguage = this.store.peekAll('language').find(l => l.get('code') == 'NED');
    const defaultCountry = this.store.peekAll('country').find(c => c.get('code') == 'BE');

    const customer = this.store.createRecord('customer', {
      isCompany: false,
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: defaultLanguage,
      country: defaultCountry
    });

    return customer.save();
  }
});
