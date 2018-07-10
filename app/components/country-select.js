import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    const countries = this.store.peekAll('country');
    this.set('options', countries);
  },
  label: 'Land',
  value: null,
  errors: null,
  onSelectionChange: null
});
