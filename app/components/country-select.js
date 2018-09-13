import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { proxyAware } from '../utils/proxy-aware';

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  init() {
    this._super(...arguments);
    const countries = this.store.peekAll('country');
    this.set('options', countries);
  },

  label: 'Land',
  value: null,
  errors: null,
  required: false,
  onSelectionChange: null
});
