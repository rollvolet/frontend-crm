import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { observes } from '@ember-decorators/object';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import DebouncedSearch from '../../mixins/debounced-search-task';
import { task } from 'ember-concurrency';

@classic
@classNames('orders-table')
export default class OrdersTable extends Component.extend(DebouncedSearch) {
  @service
  router;

  init() {
    super.init(...arguments);
    this.search.perform();
  }

  page = 0;
  size = 10;
  sort = '-order-date';

  @observes('page', 'size', 'sort')
  dataTableParamChanged() { // eslint-disable-line ember/no-observers
    this.search.perform();
  }

  @task(function * () {
    const orders = yield this.customer.query('orders', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'building,offer',
      filter: {
        'request-number': this.getFilterValue('requestNumber'),
        'offer-number': this.getFilterValue('offerNumber'),
        reference: this.getFilterValue('reference'),
        building: {
          name: this.getFilterValue('name'),
          'postal-code': this.getFilterValue('postalCode'),
          city: this.getFilterValue('city'),
          street: this.getFilterValue('street')
        }
      }
    });
    this.set('orders', orders);
  })
  search;

  @action
  setFilter(key, value) {
    this.set(key, value);
    this.debounceSearch.perform(this.search);
  }

  @action
  resetFilters() {
    this.set('requestNumber', undefined);
    this.set('offerNumber', undefined);
    this.set('reference', undefined);
    this.set('name', undefined);
    this.set('postalCode', undefined);
    this.set('city', undefined);
    this.set('street', undefined);
    this.search.perform();
  }

  @action
  clickRow(row) {
    const orderId = row.get('id');
    this.router.transitionTo('main.case.order.edit', this.customer, orderId);
  }
}
