import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),

  init() {
    this._super(...arguments);
    const building = this.store.createRecord('building', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true
    });
    building.set('customer', this.customer);
    this.set('model', building);
  },

  customer: null,
  onClose: null
});
