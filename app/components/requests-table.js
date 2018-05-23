import Component from '@ember/component';
import DebouncedSearch from '../mixins/debounced-search-task';
import { observer } from '@ember/object';
import { task } from 'ember-concurrency';

export default Component.extend(DebouncedSearch, {
  classNames: ['requests-table'],
  init() {
    this._super(...arguments);
    this.get('search').perform();
  },

  onClickRow: null,
  openNew: null,

  page: 0,
  size: 10,
  sort: '-request-date',
  dataTableParamChanged: observer('page', 'size', 'sort', function() {
    this.get('search').perform();
  }),
  search: task(function * () {
    const requests = yield this.get('customer').query('requests', {
      page: {
        size: this.get('size'),
        number: this.get('page')
      },
      sort: this.get('sort'),
      include: 'way-of-entry,building',
      filter: {
        number: this.getFilterValue('number'),
        building: {
          name: this.getFilterValue('name'),
          'postal-code': this.getFilterValue('postalCode'),
          city: this.getFilterValue('city'),
          street: this.getFilterValue('street')
        }
      }
    });
    this.set('requests', requests);
  }),
  actions: {
    setFilter(key, value) {
      this.set(key, value);
      this.get('debounceSearch').perform(this.get('search'));
    },
    resetFilters() {
      ['number', 'name', 'postalCode', 'city', 'street'].forEach(f => this.set(f, undefined));
      this.get('search').perform();
    }
  }
});
