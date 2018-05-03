import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    const postalCodes = this.store.peekAll('postal-code');
    this.set('options', postalCodes);
  },
  label: 'Gemeente',
  value: null,
  postalCode: null,
  city: null,
  actions: {
    selectValue(value) {
      this.set('value', value);
      this.set('postalCode', value ? value.get('code') : undefined);
      this.set('city', value ? value.get('name') : undefined);
    }
  }
});
