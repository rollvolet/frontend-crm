import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    const countries = this.store.peekAll('country');
    this.set('options', countries);
  },
  didInsertElement() {
    this._super(...arguments);
    if (this.value == null || this.value.content === null) { // empty value or empty proxy object
      const defaultValue = this.options.find(c => c.get('code') == 'BE');
      warn("No default country with code 'BE' found", defaultValue != null, { id: 'select.no-default-value' });
      this.onSelectionChange(defaultValue);
    }
  },
  label: 'Land',
  value: null,
  onSelectionChange: null
});
