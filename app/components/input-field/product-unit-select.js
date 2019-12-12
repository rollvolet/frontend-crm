import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { proxyAware } from '../../utils/proxy-aware';

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  init() {
    this._super(...arguments);
    const units = this.store.peekAll('product-unit');
    this.set('options', units);
  },

  label: 'Eenheid',
  value: null,
  errors: null,
  required: false,
  onSelectionChange: null
});
