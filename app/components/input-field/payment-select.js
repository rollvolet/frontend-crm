import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { proxyAware } from '../../utils/proxy-aware';

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  init() {
    this._super(...arguments);
    const payments = this.store.peekAll('payment');
    this.set('options', payments);
  },

  label: 'Bank',
  value: null,
  onSelectionChange: null
});
