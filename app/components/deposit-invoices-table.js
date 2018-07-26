import Component from '@ember/component';
import DebouncedSearch from '../mixins/debounced-search-task';
import { observer } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend(DebouncedSearch, {
  classNames: ['deposit-invoices-table'],

  router: service(),

  init() {
    this._super(...arguments);
    this.get('search').perform();
  },

  page: 0,
  size: 10,
  sort: '-number',
  dataTableParamChanged: observer('page', 'size', 'sort', function() {
    this.get('search').perform();
  }),
  search: task(function * () {
    const invoices = yield this.get('customer').query('depositInvoices', {
      page: {
        size: this.get('size'),
        number: this.get('page')
      },
      sort: this.get('sort'),
      include: 'order,building',
      filter: {
        number: this.getFilterValue('number'),
        reference: this.getFilterValue('reference'),
        building: {
          name: this.getFilterValue('name'),
          'postal-code': this.getFilterValue('postalCode'),
          city: this.getFilterValue('city'),
          street: this.getFilterValue('street')
        }
      }
    });
    this.set('depositInvoices', invoices);
  }),
  actions: {
    setFilter(key, value) {
      this.set(key, value);
      this.get('debounceSearch').perform(this.get('search'));
    },
    resetFilters() {
      this.set('number', undefined);
      this.set('reference', undefined);
      this.set('name', undefined);
      this.set('postalCode', undefined);
      this.set('city', undefined);
      this.set('street', undefined);
      this.get('search').perform();
    },
    clickRow(row) {
      const orderId = row.get('order.id');
      this.router.transitionTo('main.case.order.edit.deposit-invoices', this.customer, orderId);
    }
  }
});
