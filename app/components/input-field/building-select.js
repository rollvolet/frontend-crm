import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { proxyAware } from '../../utils/proxy-aware';

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  didReceiveAttrs() {
    if (this.customer)
      this.get('customer.buildings').then((buildings) => this.set('options', buildings));
  },

  customer: null,
  label: 'Gebouw',
  value: null,
  onSelectionChange: null
});
