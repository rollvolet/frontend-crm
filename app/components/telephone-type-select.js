import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    this.get('store').findAll('telephone-type').then(types => {
      const supportedTypes = types.filter(t => ['TEL', 'FAX'].includes(t.name));
      this.set('options', supportedTypes);
    });
  },
  label: "Type",
  value: null
});
