import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),

  didReceiveAttrs() {
    if (this.customer)
      this.get('customer.contacts').then((contacts) => this.set('options', contacts));
  },

  customer: null,
  label: 'Contact',
  value: null,
  onSelectionChange: null
});
