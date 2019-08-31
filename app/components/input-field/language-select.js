import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { proxyAware } from '../../utils/proxy-aware';
import { computed } from '@ember/object';

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  init() {
    this._super(...arguments);
    const languages = this.store.peekAll('language');
    this.set('options', languages);
  },

  label: 'Taal',
  value: null,
  errors: null,
  required: false,
  onSelectionChange: null,

  placeholder: computed('label', 'required', function() {
    return this.required ? `${this.label} *` : this.label;
  })
});
