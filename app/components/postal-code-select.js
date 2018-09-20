import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),

  init() {
    this._super(...arguments);
    const postalCodes = this.store.peekAll('postal-code');
    this.set('options', postalCodes);
  },

  didInsertElement() {
    this._super(...arguments);
    if (this.postalCode && this.city) {
      const value = this.options.find(o => o.code == this.postalCode && o.name == this.city.toUpperCase());
      this.set('value', value);
    }
  },

  label: 'Gemeente',
  value: null,
  postalCode: null,
  city: null,
  onSelectionChange: null,

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
