import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    const wayOfEntries = this.store.peekAll('way-of-entry');
    this.set('options', wayOfEntries);
  },
  label: 'Aanmelding',
  value: null,
  onSelectionChange: null
});
