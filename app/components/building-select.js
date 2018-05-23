import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),

  didReceiveAttrs() {
    if (this.customer)
      this.get('customer.buildings').then((buildings) => this.set('options', buildings));
  },

  customer: null,
  label: 'Gebouw',
  value: null,
  onSelectionChange: null
});
