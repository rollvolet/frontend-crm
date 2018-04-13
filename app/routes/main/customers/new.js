import Route from '@ember/routing/route';
import { A } from '@ember/array';

export default Route.extend({
  model() {
    return this.get('store').createRecord('customer', {
      isCompany: false,
      printInFront: true,
      printPrefix: true,
      printSuffix: true
    });
  },
  setupController(controller, model) {
    this._super(controller, model);

    controller.set('telephones', A());
    const telephone = this.get('store').createRecord('telephone', {});
    controller.get('telephones').pushObject(telephone);
  }
});
