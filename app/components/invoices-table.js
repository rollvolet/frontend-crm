import Component from '@ember/component';
import DebouncedSearch from '../mixins/debounced-search-task';
import { observer } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend(DebouncedSearch, {
  classNames: ['invoices-table'],

  router: service(),

  init() {
    this._super(...arguments);
    this.search.perform();
  },

  page: 0,
  size: 10,
  sort: '-number',
  dataTableParamChanged: observer('page', 'size', 'sort', function() { // eslint-disable-line ember/no-observers
    this.search.perform();
  }),
  search: task(function * () {
    const invoices = yield this.customer.query('invoices', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'building',
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
    this.set('invoices', invoices);
  }),
  actions: {
    setFilter(key, value) {
      this.set(key, value);
      this.debounceSearch.perform(this.search);
    },
    resetFilters() {
      this.set('number', undefined);
      this.set('reference', undefined);
      this.set('name', undefined);
      this.set('postalCode', undefined);
      this.set('city', undefined);
      this.set('street', undefined);
      this.search.perform();
    },
    clickRow(row) {
      const invoiceId = row.get('id');
      this.router.transitionTo('main.case.invoice.edit', this.customer, invoiceId);
    },
    openNewInvoice() {
      this.router.transitionTo('main.case.invoice.new', this.customer);
    }
  }
});
