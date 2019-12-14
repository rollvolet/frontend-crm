import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { or, isEmpty } from 'ember-awesome-macros';

export default Component.extend({
  store: service(),

  isAddOptionDisabled: or(isEmpty('newCode'), isEmpty('newCity')),

  init() {
    this._super(...arguments);
    const postalCodes = this.store.peekAll('postal-code');
    this.set('postalCodes', postalCodes);
    this.set('options', this.postalCodes.slice(0, this.size));
  },

  didInsertElement() {
    this._super(...arguments);
    if (this.postalCode && this.city) {
      const value = this.postalCodes.find(o => o.code == this.postalCode && o.name == this.city.toUpperCase());

      if (value) {
        this.set('value', value);
      } else {
        const postalCode = this.store.createRecord('postal-code', {
          code: this.postalCode,
          name: this.city.toUpperCase()
        });
        this.set('value', postalCode);
      }
    }
  },

  search: task(function* (term) {
    yield timeout(100);
    return this.postalCodes.filter(p => p.search.toLowerCase().includes(term)).slice(0, this.size);
  }).keepLatest(),

  label: 'Gemeente',
  value: null,
  postalCode: null,
  city: null,
  onSelectionChange: null,
  size: 50,
  titleize: false,

  actions: {
    selectValue(value) {
      this.set('value', value);
      if (value)
        this.onSelectionChange(value.code, value.name);
      else
        this.onSelectionChange(undefined, undefined);
    },
    addOption() {
      const postalCode = this.store.createRecord('postal-code', {
        code: this.newCode,
        name: this.newCity.toUpperCase()
      });
      this.set('value', postalCode);
      this.onSelectionChange(postalCode.code, postalCode.name);
      this.set('showCreateModal', false);
      this.set('newCode', null);
      this.set('newCity', null);
    }
  }
});
