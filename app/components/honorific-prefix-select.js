import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { composeId } from '../models/honorific-prefix';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    this.get('store').findAll('honorific-prefix').then(prefixes => this.set('honorificPrefixes', prefixes));
  },
  label: 'Aanspreektitel',
  value: null,
  language: null,
  options: computed('honorificPrefixes', 'honorificPrefixes.[]', 'language', function() {
    if (this.get('honorificPrefixes') && this.get('language')) {
      return this.get('honorificPrefixes').filter(p => {
        return p.get('name') && p.get('languageId') == this.get('language.id');
      });
    } else {
      return this.get('honorificPrefixes');
    }
  }),
  languageChanged: observer('language', function() {
    if (this.get('value')) {
      const honorificPrefix = this.get('options').find(p => {
        // Find same prefix in the new language
        return p.get('id') == composeId(this.get('value.entityId'), this.get('language.id'));
      });
      this.set('value', honorificPrefix);
    }
  })
});
