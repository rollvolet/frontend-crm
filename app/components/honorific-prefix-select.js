import { next } from '@ember/runloop';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { composeId } from '../models/honorific-prefix';
import { proxyAware } from '../utils/proxy-aware';

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  async init() {
    this._super(...arguments);
    const prefixes = this.store.peekAll('honorific-prefix');
    this.set('honorificPrefixes', prefixes);
  },

  label: 'Aanspreektitel',
  value: null,
  language: null,
  onSelectionChange: null,

  options: computed('honorificPrefixes', 'honorificPrefixes.[]', 'language', 'language.content', function() {
    if (this.honorificPrefixes && this.get('language.id')) {
      return this.honorificPrefixes.filter(p => {
        return p.name && p.languageId == this.get('language.id');
      });
    } else {
      return this.honorificPrefixes.filter(p => p.name);
    }
  }),

  didUpdateAttrs() {
    this._super(...arguments);

    if (this.get('value.entityId') && this.get('language.id') && this.get('value.languageId') != this.get('language.id')) { // the language changed while a prefix has already been selected
      const honorificPrefix = this.honorificPrefixes.find(p => {
        // Find same prefix in the new language
        return p.get('id') == composeId(this.get('value.entityId'), this.get('language.id'));
      });
      next(this, function() {
        this.onSelectionChange(honorificPrefix);
      });
    }
  }
});
