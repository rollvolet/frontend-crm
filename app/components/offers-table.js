import Component from '@ember/component';
import { observer } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  classNames: ['offers-table'],
  init() {
    this._super(...arguments);
    this.get('search').perform();
  },
  page: 0,
  size: 10,
  sort: '-offer-date',
  dataTableParamChanged: observer('page', 'size', 'sort', function() {
    this.get('search').perform();
  }),
  debouncedSearch: task(function * () {
    yield timeout(500);
    this.set('page', 0);
    yield this.get('search').perform();
  }).restartable(),
  search: task(function * () {
    const offers = yield this.get('customer').query('offers', {
      page: {
        size: this.get('size'),
        number: this.get('page')
      },
      sort: this.get('sort'),
      include: 'building',
      filter: {
        number: this.get('number'),
        reference: this.get('reference'),
        building: {
          name: this.get('name'),
          'postal-code': this.get('postalCode'),
          city: this.get('city'),
          street: this.get('street')
        }
      }
    });
    this.set('offers', offers);
  }),
  actions: {
    setFilter(key, value) {
      this.set(key, value);
      this.get('debouncedSearch').perform();
    },
    resetFilters() {
      this.set('number', undefined);
      this.set('reference', undefined);
      this.set('name', undefined);
      this.set('postalCode', undefined);
      this.set('city', undefined);
      this.set('street', undefined);
      this.get('search').perform();
    }
  }
});
