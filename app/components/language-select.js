import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    const languages = this.store.peekAll('language');
    this.set('options', languages);
  },
  didInsertElement() {
    this._super(...arguments);
    if (this.value == null || this.value.content === null) { // empty value or empty proxy object
      const defaultValue = this.options.find(l => l.get('code') == 'NED');
      warn("No default language with code 'NED' found", defaultValue != null, { id: 'select.no-default-value' });
      this.onSelectionChange(defaultValue);
    }
  },
  label: 'Taal',
  value: null,
  onSelectionChange: null
});
