import { computed } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { proxyAware } from '../utils/proxy-aware';

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  init() {
    this._super(...arguments);
    const countries = this.store.peekAll('country');
    this.set('options', countries);
  },

  label: 'Land',
  value: null,
  onSelectionChange: null,
  errors: null,

  placeholder: computed('label', 'required', function() {
    return this.required ? `${this.label} *` : this.label;
  })
});
