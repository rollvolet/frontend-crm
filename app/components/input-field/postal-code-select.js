import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  store: service(),

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
      this.set('value', value);
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
    }
  }
});
