import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    const vatRates = this.store.peekAll('vat-rate');
    this.set('options', vatRates);
  },
  label: 'BTW tarief',
  value: null,
  onSelectionChange: null
});
