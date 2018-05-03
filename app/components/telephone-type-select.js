import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    const types = this.store.peekAll('telephone-type');
    const supportedTypes = types.filter(t => ['TEL', 'FAX'].includes(t.name));
    this.set('options', supportedTypes);
  },
  label: 'Type',
  value: null
});
