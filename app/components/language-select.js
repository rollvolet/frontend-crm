import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    this.get('store').findAll('language').then(languages => {
      if (this.value == null) {
        const defaultValue = languages.find(l => l.get('code') == 'NED');
        warn("No default language with code 'NED' found", defaultValue != null, { id: 'select.no-default-value' });
        this.set('value', defaultValue);
      }
      this.set('options', languages);
    });
  },
  label: "Taal",
  value: null
});
