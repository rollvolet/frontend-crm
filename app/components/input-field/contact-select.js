import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { proxyAware } from '../../utils/proxy-aware';

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  didReceiveAttrs() {
    if (this.customer)
      this.get('customer.contacts').then((contacts) => this.set('options', contacts));
  },

  customer: null,
  label: 'Contact',
  value: null,
  onSelectionChange: null
});
