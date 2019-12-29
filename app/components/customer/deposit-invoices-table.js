import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { observes } from '@ember-decorators/object';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import DebouncedSearch from '../../mixins/debounced-search-task';
import { task } from 'ember-concurrency';

@classic
@classNames('deposit-invoices-table')
export default class DepositInvoicesTable extends Component.extend(DebouncedSearch) {
  @service
  router;

  init() {
    super.init(...arguments);
    this.search.perform();
  }

  page = 0;
  size = 10;
  sort = '-number';

  @observes('page', 'size', 'sort')
  dataTableParamChanged() { // eslint-disable-line ember/no-observers
    this.search.perform();
  }

  @task(function * () {
    const invoices = yield this.customer.query('depositInvoices', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
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
  })
  search;

  @action
  setFilter(key, value) {
    this.set(key, value);
    this.debounceSearch.perform(this.search);
  }

  @action
  resetFilters() {
    this.set('number', undefined);
    this.set('reference', undefined);
    this.set('name', undefined);
    this.set('postalCode', undefined);
    this.set('city', undefined);
    this.set('street', undefined);
    this.search.perform();
  }

  @action
  clickRow(row) {
    const orderId = row.get('order.id');
    this.router.transitionTo('main.case.order.edit.deposit-invoices', this.customer, orderId);
  }
}
