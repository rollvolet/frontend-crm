import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),

  init() {
    this._super(...arguments);
    const contact = this.store.createRecord('contact', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true
    });
    contact.set('customer', this.customer);
    this.set('model', contact);
  },

  customer: null,
  onClose: null,

  actions: {
    async cancel() {
      await this.model.destroyRecord();
      this.onClose();
    }
  }
});
