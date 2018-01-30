import Component from '@ember/component';
import { observer } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  classNames: ['orders-table'],
  init() {
    this._super(...arguments);
    this.get('search').perform();
  },
  page: 0,
  size: 10,
  sort: '-order-date',
  dataTableParamChanged: observer('page', 'size', 'sort', function() {
    this.get('search').perform();
  }),
  debouncedSearch: task(function * () {
    yield timeout(500);
    this.set('page', 0);
    yield this.get('search').perform();
  }).restartable(),
  search: task(function * () {
    const orders = yield this.get('customer').query('orders', {
      page: {
        size: this.get('size'),
        number: this.get('page')
      },
      sort: this.get('sort'),
      include: 'building',
      filter: {
        offerNumber: this.get('offerNumber'),
        reference: this.get('reference'),
        building: {
          name: this.get('name'),
          'postal-code': this.get('postalCode'),
          city: this.get('city'),
          street: this.get('street')
        }
      }
    });
    this.set('orders', orders);
  }),
  actions: {
    setFilter(key, value) {
      this.set(key, value);
      this.get('debouncedSearch').perform();
    },
    resetFilters() {
      this.set('offerNumber', undefined);
      this.set('reference', undefined);
      this.set('name', undefined);
      this.set('postalCode', undefined);
      this.set('city', undefined);
      this.set('street', undefined);
      this.get('search').perform();
    }
  }
});
