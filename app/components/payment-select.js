import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    const payments = this.store.peekAll('payment');
    this.set('options', payments);
  },
  label: 'Bank',
  value: null,
  onSelectionChange: null
});
