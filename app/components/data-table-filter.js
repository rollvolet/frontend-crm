import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  tagName: '',

  filterKeys: Object.freeze([]),

  onChange: null,

  didReceiveAttrs() {
    this._super(...arguments);
    for (let key of this.filterKeys) {
      const value = this.get(key);
      this.set(`${key}Filter`, value);
    }
  },

  didInsertElement() {
    this._super(...arguments);
    document.querySelector('.search-autofocus input').focus();
  },

  getFilter() {
    const filter = {};
    for (let key of this.filterKeys) {
      filter[key] = this.get(`${key}Filter`);
    }
    return filter;
  },

  debounceFilter: task(function * (key, value) {
    this.set(`${key}Filter`, value);
    yield timeout(500);
    this.onChange(this.getFilter());
  }).restartable(),

  actions: {
    resetFilters() {
      this.filterKeys.forEach(key => this.set(`${key}Filter`, undefined));
      this.onChange(this.getFilter());
    },
    setFilter(key, value) {
      this.set(`${key}Filter`, value);
      this.onChange(this.getFilter());
    }
  }
});
