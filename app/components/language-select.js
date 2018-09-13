import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { proxyAware } from '../utils/proxy-aware';
export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  init() {
    this._super(...arguments);
    const languages = this.store.peekAll('language');
    this.set('options', languages);
  },

  label: 'Taal',
  value: null,
  errors: null,
  required: false,
  onSelectionChange: null
});
