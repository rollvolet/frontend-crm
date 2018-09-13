import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { proxyAware } from '../utils/proxy-aware';

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  init() {
    this._super(...arguments);
    const types = this.store.peekAll('telephone-type');
    const supportedTypes = types.filter(t => ['TEL', 'FAX'].includes(t.name));
    this.set('options', supportedTypes);
  },

  label: 'Type',
  value: null,
  onSelectionChange: null
});
