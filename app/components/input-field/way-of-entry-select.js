import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { proxyAware } from '../../utils/proxy-aware';
import { sort } from '@ember/object/computed';

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  init() {
    this._super(...arguments);
    const wayOfEntries = this.store.peekAll('way-of-entry');
    this.set('options', wayOfEntries);
  },

  optionSort: Object.freeze(['position']),
  sortedOptions: sort('options', 'optionSort'),

  label: 'Aanmelding',
  value: null,
  onSelectionChange: null
});
