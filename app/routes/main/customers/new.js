import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return this.store.createRecord('customer', {
      isCompany: false,
      printInFront: true,
      printPrefix: true,
      printSuffix: true
    });
  }
});
