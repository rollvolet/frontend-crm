import Component from '@ember/component';
import DebouncedSearch from '../mixins/debounced-search-task';
import { observer } from '@ember/object';
import { task } from 'ember-concurrency';

export default Component.extend(DebouncedSearch, {
  classNames: ['buildings-table'],

  init() {
    this._super(...arguments);
    this.search.perform();
  },

  page: 0,
  size: 10,
  sort: 'name',

  onClickRow: null,

  dataTableParamChanged: observer('page', 'size', 'sort', function() { // eslint-disable-line ember/no-observers
    this.search.perform();
  }),
  search: task(function * () {
    const buildings = yield this.customer.query('buildings', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'country,language,honorific-prefix',
      filter: {
        number: this.getFilterValue('number'),
        name: this.getFilterValue('name'),
        'postal-code': this.getFilterValue('postalCode'),
        city: this.getFilterValue('city'),
        street: this.getFilterValue('street'),
        telephone: this.getFilterValue('telephone')
      }
    });
    this.set('buildings', buildings);
  }),

  actions: {
    setFilter(key, value) {
      this.set(key, value);
      this.debounceSearch.perform(this.search);
    },
    resetFilters() {
      this.set('number', undefined);
      this.set('name', undefined);
      this.set('postalCode', undefined);
      this.set('city', undefined);
      this.set('street', undefined);
      this.set('telephone', undefined);
      this.search.perform();
    },
    edit(building) {
      this.onEdit(building);
    }
  }
});
