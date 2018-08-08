import Component from '@ember/component';
import DebouncedSearch from '../mixins/debounced-search-task';
import { observer } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend(DebouncedSearch, {
  classNames: ['requests-table'],

  router: service(),

  init() {
    this._super(...arguments);
    this.search.perform();
  },

  page: 0,
  size: 10,
  sort: '-request-date',
  dataTableParamChanged: observer('page', 'size', 'sort', function() {
    this.search.perform();
  }),
  search: task(function * () {
    const requests = yield this.customer.query('requests', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
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
      this.debounceSearch.perform(this.search);
    },
    resetFilters() {
      ['number', 'name', 'postalCode', 'city', 'street'].forEach(f => this.set(f, undefined));
      this.search.perform();
    },
    clickRow(row) {
      const requestId = row.get('id');
      this.router.transitionTo('main.case.request.edit', this.customer, requestId);
    },
    openNewRequest() {
      this.router.transitionTo('main.case.request.new', this.customer);
    }
  }
});
